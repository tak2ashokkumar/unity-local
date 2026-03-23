var app = angular.module('uldb');

app.factory('InvoiceService', [
    function () {
        var generatePDF = function (invoice) {
            var convertImage = function (src, callback) {
                var image = new Image();
                image.onload = function () {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    canvas.height = this.height;
                    canvas.width = this.width;
                    ctx.drawImage(this, 0, 0);
                    var imageData = canvas.toDataURL();
                    callback(imageData);
                };
                image.src = src;
            };

            convertImage('/static/img/ul_logo.png', function (imageData) {
                var pdf = new jsPDF('p', 'pt', 'a4');
                pdf.addImage(imageData, 'PNG', 20, 20, 555, 107);
                pdf.setFont('helvetica');
                pdf.setFontSize(20);
                pdf.text(20, 130, invoice.opportunity_name + ": $" + invoice.amount_billed);
                pdf.setFontSize(10);
                pdf.text(20, 145, invoice.billing_month + " " + invoice.billing_year);

                var columns = [
                    { title: 'Product', dataKey: 'product' },
                    { title: 'Unit Price', dataKey: 'unit_price' },
                    { title: 'Qty', dataKey: 'qty' },
                    { title: 'Total Price', dataKey: 'total_price' }
                ];

                var rows = [];
                var line_item_length = invoice.invoice_line_items.length;
                for (var idx = 0; idx < line_item_length; ++idx) {
                    rows.push({
                        'product': invoice.invoice_line_items[idx].PricebookEntry.Product2.Name,
                        'unit_price': '$' + invoice.invoice_line_items[idx].UnitPrice,
                        'qty': invoice.invoice_line_items[idx].Quantity,
                        'total_price': '$' + invoice.invoice_line_items[idx].TotalPrice
                    });
                }

                pdf.autoTable(columns, rows, {
                    theme: 'grid',
                    margin: {
                        top: 180,
                        left: 20
                    },
                    beforePageContent: function () {
                        pdf.setFontSize(10);
                        pdf.setFontStyle('bold');
                        pdf.text('Line Items', 20, 170);
                    }
                });

                pdf.save(invoice.opportunity_name + ' - ' + invoice.billing_month + " " + invoice.billing_year);
            });
        };

        return {
            generatePDF: generatePDF
        };
    }
]);
