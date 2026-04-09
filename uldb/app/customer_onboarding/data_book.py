import openpyxl
from tablib import Databook, Dataset
from copy import deepcopy
import sys
if sys.version_info[0] > 2:
    from io import BytesIO
else:
    from cStringIO import StringIO as BytesIO


class ExcelDataBook(Databook):
    def load(self, format, in_stream, **kwargs):
        """
        Import `in_stream` to the :class:`Databook` object using the `format`.
        :param \*\*kwargs: (optional) custom configuration to the format `import_book`.
        """

        self.wipe()

        xls_book = openpyxl.reader.excel.load_workbook(BytesIO(in_stream))

        for sheet in xls_book.worksheets:
            data = Dataset()

            data.title = sheet.title

            for i, row in enumerate(sheet.rows):
                row_vals = [c.value.strip() if (hasattr(c.value, 'strip')) else c.value for c in row]
                if (i == 0):
                    continue
                if (i == 1):
                    data.headers = row_vals
                    continue
                if row_vals[0] is None:
                    continue
                else:
                    data.append(row_vals)

            self.add_sheet(data)
        return self
