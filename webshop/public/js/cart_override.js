frappe.provide("shopping_cart");

shopping_cart.place_order = function(btn) {
    shopping_cart.freeze();

    return frappe.call({
        type: "POST",
        method: "webshop.webshop.shopping_cart.cart.place_order",  // your custom method
        btn: btn,
        freeze: true,
        freeze_message: "Placing your order...",
        callback: function(r) {
            shopping_cart.unfreeze();

            if (r.exc) {
                let msg = "";
                if (r._server_messages) {
                    msg = JSON.parse(r._server_messages || []).join("<br>");
                }

                $("#cart-error")
                    .empty()
                    .html(msg || frappe._("Something went wrong!"))
                    .toggle(true);

            } else if (r.message) {
                frappe.msgprint(`Sales Order ${r.message} submitted for approval.`);

                setTimeout(() => {
                    window.location.href = `/orders/${r.sales_order}`;
                }, 1500);
            }
        }
    });
};
