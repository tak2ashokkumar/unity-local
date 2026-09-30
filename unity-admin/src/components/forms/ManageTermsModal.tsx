import { Fragment, useEffect, useState } from 'react';
import { api } from '../../data/apiClient';
import { ApiRecord } from '../../data/types';
import { scalarize } from '../../utils/format';
import { Button, LoadingBlock } from '../ui/primitives';
import { FormModal } from '../ui/Overlay';
import { useToast } from '../ui/Toast';

/*
 * Service Catalogue "Manage Term" - ports getTermDetails / showTermModal / addTerm
 * (controllers/v3/ul-admin/servicecataloguescontroller.js:61).
 *
 * Each catalogue entry carries exactly three pricing terms:
 *   GET  service_term/?catalogue_id={id}  -> { results: [{term, charge} x3] }
 *   POST service_term/                    -> the flat modal object below
 *
 * The POST body shape is the legacy $scope.modal_obj verbatim, including `index`
 * and `catalogue`, because that is what the endpoint is written against.
 */
export interface ManageTermsModalProps {
  row: ApiRecord;
  rowIndex: number;
  onClose: () => void;
}

interface Term {
  term: string;
  price: string;
}

const EMPTY: Term[] = [
  { term: '', price: '' },
  { term: '', price: '' },
  { term: '', price: '' },
];

const ORDINALS = ['first', 'second', 'third'] as const;
const LABELS = ['First Term', 'Second Term', 'Third Term'];

export function ManageTermsModal({ row, rowIndex, onClose }: ManageTermsModalProps) {
  const toast = useToast();
  const [terms, setTerms] = useState<Term[]>(EMPTY);
  const [method, setMethod] = useState<'Add' | 'Edit'>('Add');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .list<ApiRecord>('service_term', { catalogue_id: String(row.id) })
      .then((res) => {
        if (!active) return;
        const rows = res.items;
        // Legacy treated "three terms came back" as Edit and anything else as Add.
        if (rows.length >= 3) {
          setTerms(
            rows.slice(0, 3).map((t) => ({
              term: scalarize(t.term),
              price: scalarize(t.charge),
            }))
          );
          setMethod('Edit');
        } else {
          setTerms(EMPTY);
          setMethod('Add');
        }
      })
      .catch(() => {
        if (active) {
          setTerms(EMPTY);
          setMethod('Add');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [row.id]);

  const setTerm = (i: number, key: keyof Term, value: string) =>
    setTerms((prev) => prev.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));

  const complete = terms.every((t) => t.term.trim() !== '' && t.price.trim() !== '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete || saving) return;
    setSaving(true);
    try {
      const payload: ApiRecord = { index: rowIndex, catalogue: row, method };
      ORDINALS.forEach((ord, i) => {
        payload[`${ord}_term`] = Number(terms[i].term);
        payload[`${ord}_term_price`] = Number(terms[i].price);
      });
      await api.create('service_term', payload);
      toast.success('Terms updated successfully.', 'Saved');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the terms.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={`${method} Terms`}
      subtitle={scalarize(row.name ?? row.device_type)}
      onClose={onClose}
    >
      {loading ? (
        <LoadingBlock label="Loading terms..." />
      ) : (
        <form className="record-form" onSubmit={submit}>
          <div className="form-grid">
            {terms.map((t, i) => (
              <Fragment key={ORDINALS[i]}>
                <div className="field">
                  <label>
                    {LABELS[i]}
                    <span className="req">*</span>
                  </label>
                  <input type="number" min={1} value={t.term} onChange={(e) => setTerm(i, 'term', e.target.value)} />
                </div>
                <div className="field">
                  <label>
                    Price<span className="req">*</span>
                  </label>
                  <input type="number" step="0.01" value={t.price} onChange={(e) => setTerm(i, 'price', e.target.value)} />
                </div>
              </Fragment>
            ))}
          </div>
          <div className="form-actions">
            <Button variant="default" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!complete || saving} loading={saving}>
              {method}
            </Button>
          </div>
        </form>
      )}
    </FormModal>
  );
}
