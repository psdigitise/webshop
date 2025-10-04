frappe.cart_management_details = {
    make: function(wrapper) {
        const sales_order = frappe.get_route()[1];  'SAL-001'
        $(wrapper).html(`<div class="cart-details-page">
            <h2>Sales Order: ${sales_order}</h2>
            <div id="sales-order-details"></div>
        </div>`);

        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Sales Order",
                name: sales_order
            },
            callback: function(r) {
                if (r.message) {
                    const so = r.message;
                    $("#sales-order-details").html(`
                        <p><strong>Customer:</strong> ${so.customer}</p>
                        <p><strong>Status:</strong> ${so.status}</p>
                        <p><strong>Grand Total:</strong> ₹${so.grand_total}</p>
                    `);
                } else {
                    $("#sales-order-details").html(`<p>Sales Order not found.</p>`);
                }
            }
        });
    }
};
