import { FormEvent, useMemo, useState } from 'react';
import { ApiRecord } from '../../data/types';
import { FieldDef, InputType } from '../../config/fieldTypes';
import { isEmpty } from '../../utils/format';
import { Button } from '../ui/primitives';
import { Typeahead } from './Typeahead';
import { MultiSelect } from './MultiSelect';

export interface RecordFormProps {
  fields: FieldDef[];
  method: 'Add' | 'Edit';
  initial?: ApiRecord;
  submitting?: boolean;
  serverErrors?: Record<string, string>;
  nonFieldError?: string | null;
  onSubmit: (values: ApiRecord) => void;
  onCancel: () => void;
}

function defaultInput(field: FieldDef): InputType {
  if (field.input) return field.input;
  if (field.objChoices) return 'obj_choices';
  if (field.choices) return 'choices';
  if (field.cell === 'boolean') return 'boolean';
  if (field.cell === 'number') return 'number';
  if (field.cell === 'multiple' && field.lookupUri) return 'multiple';
  if (field.cell === 'fk' && field.lookupUri) return 'typeahead';
  // Legacy rendered every datetime field through <datetimepicker minView:'day'>,
  // i.e. a day-granularity date picker. Without this these arrived as free text.
  if (field.cell === 'datetime') return 'datetime';
  return 'text';
}

function initialValue(field: FieldDef, initial?: ApiRecord): unknown {
  const bag = field.group && initial ? (initial[field.group] as ApiRecord | undefined) : undefined;
  const raw = field.group ? bag?.[field.name] : initial ? initial[field.name] : undefined;
  const input = defaultInput(field);
  // Fields whose stored shape differs from the edited shape convert here.
  if (field.toInput) {
    const mapped = field.toInput(raw, initial || {});
    if (mapped !== undefined && mapped !== null) return mapped;
  } else if (raw !== undefined && raw !== null) return raw;
  if (input === 'boolean') return false;
  if (input === 'multiple') return [];
  if (input === 'typeahead') return null;
  // A file input cannot be pre-filled; an unpicked file means "leave as-is".
  if (input === 'file') return null;
  return '';
}

/*
 * Where this field's options come from right now.
 * Returns null when the field depends on another that has not been filled in yet -
 * the picker then renders disabled instead of requesting a URL containing
 * "undefined".
 */
// "Select Organization first" - reads the dependency's own name, not a code key.
function humanizeDependency(field: FieldDef): string {
  return (field.dependsOn || 'the parent field').replace(/[_-]+/g, ' ');
}

function resolveLookupUri(field: FieldDef, values: ApiRecord): string | null {
  if (!field.dependsOn) return field.lookupUri || field.name;
  const dep = values[field.dependsOn];
  if (dep === undefined || dep === null || dep === '') return null;
  return field.lookupUriFrom ? field.lookupUriFrom(dep) : field.lookupUri || field.name;
}

function choiceLabel(c: unknown): string {
  if (typeof c === 'boolean') return c ? 'Yes' : 'No';
  return String(c);
}

export function RecordForm({
  fields,
  method,
  initial,
  submitting,
  serverErrors = {},
  nonFieldError,
  onSubmit,
  onCancel,
}: RecordFormProps) {
  // A relation field is only editable when we know which endpoint supplies its
  // options. Auto-derived columns (resources without an explicit config) carry no
  // lookupUri, so those relations are omitted rather than rendered as an unusable
  // text box containing a raw object.
  // A dependent field carries no static lookupUri - it builds one from its parent
  // via lookupUriFrom - so it must not be mistaken for an unresolvable relation.
  const isUneditableRelation = (f: FieldDef) =>
    (f.cell === 'fk' || f.cell === 'multiple') &&
    !f.lookupUri &&
    !f.lookupUriFrom &&
    !f.choices &&
    !f.objChoices;

  const formFields = useMemo(
    () => fields.filter((f) => !f.hideInForm && !(method === 'Edit' && f.hideOnEdit) && !isUneditableRelation(f)),
    [fields, method]
  );

  const [values, setValues] = useState<ApiRecord>(() => {
    const v: ApiRecord = {};
    formFields.forEach((f) => {
      v[f.name] = initialValue(f, initial);
    });
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (name: string, val: unknown) =>
    setValues((prev) => {
      const next: ApiRecord = { ...prev, [name]: val };
      /* Anything scoped by this field is now stale. The legacy form reloaded the
         dependent lists on select (getGroupssByOrg); clearing is the safe
         equivalent, so a group belonging to the previous organization can never
         be submitted against the new one. */
      formFields.forEach((f) => {
        if (f.dependsOn === name) {
          next[f.name] = defaultInput(f) === 'multiple' ? [] : null;
        }
      });
      return next;
    });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    formFields.forEach((f) => {
      /* A required file input is only required when adding: on Edit an empty file
         input means "keep the file already stored", which is how the legacy
         upload modals behaved. */
      const skipRequired = defaultInput(f) === 'file' && method === 'Edit';
      if (f.required && !skipRequired && isEmpty(values[f.name])) {
        errs[f.name] = `${f.label} is required`;
      }
      // Legacy capped the org logo at 700KB via ngf-max-size; enforce the same
      // client-side so an oversized file fails here rather than as a server 413.
      const picked = values[f.name];
      if (f.maxSizeKb && picked instanceof File && picked.size > f.maxSizeKb * 1024) {
        errs[f.name] = `${f.label} must be ${f.maxSizeKb}KB or smaller`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /*
   * Never submit a blank password.
   *
   * The API does not return existing passwords, so a password input always seeds
   * to '' on Edit - and GenericListPage PUTs the whole record. Without this guard
   * every edit of a PDU, vCenter/OpenStack account or Zabbix/Observium instance
   * shipped `password: ""` and wiped the stored credential.
   *
   * This is the guard the legacy panel had and the port dropped:
   *   controllers/generic.js:4747
   *   if (obj.password !== undefined) obj.password = (obj.password == "" ? undefined : obj.password);
   *
   * Required-password fields on Add are still caught by validate() above, so this
   * only ever strips a field the user deliberately left blank.
   */
  const stripBlankSecrets = (raw: ApiRecord): ApiRecord => {
    const out: ApiRecord = { ...raw };
    formFields.forEach((f) => {
      if (defaultInput(f) === 'password' && !String(out[f.name] ?? '').trim()) {
        delete out[f.name];
      }
    });
    /* Convert edited values back to the shape the API stores. This runs over ALL
       fields, not just the rendered ones, so a field the form does not show can
       still derive itself from what was picked - Zabbix template definitions set
       template_name from the chosen template, as the legacy onSubmit() did. */
    fields.forEach((f) => {
      if (f.fromInput) out[f.name] = f.fromInput(out[f.name], raw);
    });
    /* Fold grouped fields back into their nested object. Existing keys on the
       original record are preserved, so a form that renders only some of the
       group's properties cannot drop the rest. */
    const groups = Array.from(
      new Set(formFields.map((f) => f.group).filter((g): g is string => Boolean(g)))
    );
    groups.forEach((g) => {
      const bag: ApiRecord = { ...((initial?.[g] as ApiRecord) || {}) };
      formFields
        .filter((f) => f.group === g)
        .forEach((f) => {
          bag[f.name] = out[f.name];
          delete out[f.name];
        });
      out[g] = bag;
    });
    return out;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(stripBlankSecrets(values));
  };

  const renderInput = (field: FieldDef) => {
    const input = defaultInput(field);
    const val = values[field.name];
    const err = errors[field.name] || serverErrors[field.name];
    const invalid = !!err;

    switch (input) {
      case 'boolean':
        return (
          <label className="switch">
            <input type="checkbox" checked={val === true || val === 'true'} onChange={(e) => set(field.name, e.target.checked)} />
            <span className="track" />
          </label>
        );
      case 'choices': {
        const choices = field.choices || [];
        return (
          <select
            className={invalid ? 'invalid' : ''}
            value={val === undefined || val === null ? '' : String(val)}
            onChange={(e) => {
              const picked = choices.find((c) => String(c) === e.target.value);
              set(field.name, picked === undefined ? e.target.value : picked);
            }}
          >
            <option value="">Select...</option>
            {choices.map((c) => (
              <option key={String(c)} value={String(c)}>
                {choiceLabel(c)}
              </option>
            ))}
          </select>
        );
      }
      case 'obj_choices': {
        const choices = field.objChoices || [];
        return (
          <select
            className={invalid ? 'invalid' : ''}
            value={val === undefined || val === null ? '' : String(val)}
            onChange={(e) => {
              const picked = choices.find((c) => String(c.value) === e.target.value);
              set(field.name, picked ? picked.value : e.target.value);
            }}
          >
            <option value="">Select...</option>
            {choices.map((c) => (
              <option key={String(c.value)} value={String(c.value)}>
                {c.label}
              </option>
            ))}
          </select>
        );
      }
      case 'typeahead': {
        const uri = resolveLookupUri(field, values);
        return (
          <Typeahead
            value={(val as ApiRecord) || null}
            lookupUri={uri}
            accessor={field.lookupAccessor || 'name'}
            placeholder={
              uri
                ? field.placeholder || `Search ${field.label.toLowerCase()}...`
                : `Select ${humanizeDependency(field)} first`
            }
            invalid={invalid}
            resultKey={field.lookupResultKey}
            labelOf={field.lookupLabel}
            onChange={(obj) => set(field.name, obj)}
          />
        );
      }
      case 'multiple': {
        const uri = resolveLookupUri(field, values);
        return (
          <MultiSelect
            value={Array.isArray(val) ? (val as ApiRecord[]) : []}
            lookupUri={uri}
            displayProp={field.subfield || 'name'}
            idProp={field.lookupIdProp || field.idField || 'id'}
            placeholder={uri ? field.placeholder : `Select ${humanizeDependency(field)} first`}
            resultKey={field.lookupResultKey}
            onChange={(items) => set(field.name, items)}
          />
        );
      }
      case 'datetime': {
        /* <input type="date"> speaks YYYY-MM-DD; the API returns full ISO
           timestamps. Convert on the way in, and keep the raw value if it is not a
           parseable date so nothing is silently destroyed. */
        const asDateInput = (v: unknown): string => {
          if (!v) return '';
          const str = String(v);
          if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
          const d = new Date(str);
          if (Number.isNaN(d.getTime())) return '';
          const pad = (n: number) => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };
        return (
          <input
            type="date"
            className={invalid ? 'invalid' : ''}
            value={asDateInput(val)}
            onChange={(e) => set(field.name, e.target.value)}
          />
        );
      }
      case 'file': {
        const picked = val instanceof File ? val : null;
        return (
          <div>
            <input
              type="file"
              className={invalid ? 'invalid' : ''}
              accept={field.accept}
              onChange={(e) => set(field.name, e.target.files && e.target.files[0] ? e.target.files[0] : null)}
            />
            {picked && <div className="field-help">{picked.name} ({Math.ceil(picked.size / 1024)} KB)</div>}
          </div>
        );
      }
      case 'textarea':
        return (
          <textarea
            className={invalid ? 'invalid' : ''}
            value={(val as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => set(field.name, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={invalid ? 'invalid' : ''}
            value={val === null || val === undefined ? '' : String(val)}
            placeholder={field.placeholder}
            onChange={(e) => set(field.name, e.target.value === '' ? '' : Number(e.target.value))}
          />
        );
      default:
        return (
          <input
            type={input === 'password' ? 'password' : input === 'email' ? 'email' : 'text'}
            className={invalid ? 'invalid' : ''}
            value={(val as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => set(field.name, e.target.value)}
          />
        );
    }
  };

  const isInlineControl = (field: FieldDef) => defaultInput(field) === 'boolean';

  // The grid is two columns wide; these controls are too tall/wide for one cell.
  const isFullWidth = (field: FieldDef) => {
    const input = defaultInput(field);
    return input === 'textarea' || input === 'multiple';
  };

  return (
    <form onSubmit={submit} id="record-form" className="record-form">
      <div className="form-grid">
        {nonFieldError && <div className="form-banner">{nonFieldError}</div>}
        {formFields.map((field) => {
          const err = errors[field.name] || serverErrors[field.name];
          const fullCls = isFullWidth(field) ? ' field-full' : '';
          if (isInlineControl(field)) {
            return (
              <div className={`field field-inline${fullCls}`} key={field.name}>
                <label>
                  {field.label}
                  {field.required && <span className="req">*</span>}
                </label>
                {renderInput(field)}
              </div>
            );
          }
          return (
            <div className={`field${fullCls}`} key={field.name}>
              <label>
                {field.label}
                {field.required && <span className="req">*</span>}
              </label>
              {renderInput(field)}
              {field.help && !err && <div className="field-help">{field.help}</div>}
              {err && <div className="field-err">{err}</div>}
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <Button type="button" variant="default" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting} icon={method === 'Add' ? 'plus' : 'check'}>
          {method === 'Add' ? 'Create' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
