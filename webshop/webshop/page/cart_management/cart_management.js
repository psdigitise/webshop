frappe.pages['cart-management'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Cart Management',
        single_column: true
    });

    $(frappe.render_template(`
        <div class="cart-list p-3">
            <h4>All User Carts</h4>
            <div id="cart-container">Loading...</div>
        </div>
    `)).appendTo(page.body);

    frappe.call({
        method: "webshop.api.get_cart_list", 
        callback: function(r) {
            if (r.message && r.message.length) {
                let html = `<table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Quotation</th>
                            <th>Customer</th>
                            <th>Owner</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>`;
                
                r.message.forEach(cart => {
                    html += `
                        <tr>
                            <td>${cart.name}</td>
                            <td>${cart.party_name || "-"}</td>
                            <td>${cart.owner}</td>
                            <td>${cart.grand_total || 0}</td>
                            <td>
                                <button class="btn btn-primary btn-sm place-order" data-name="${cart.name}">
                                    Place Order
                                </button>
                            </td>
                        </tr>`;
                });

                html += `</tbody></table>`;
                $("#cart-container").html(html);

                $(".place-order").click(function() {
                    let qtn = $(this).data("name");
                    frappe.call({
                        method: "webshop.api.place_order_from_cart", 
                        args: { quotation_name: qtn },
                        callback: function(res) {
                            if (res.message) {
                                frappe.msgprint("Sales Order Created: " + res.message);
                                setTimeout(function() {
                                location.reload();
                            }, 2000);
                            }
                        }
                    });
                });

            } else {
                $("#cart-container").html("<p>No carts found.</p>");
            }
        }
    });
};
