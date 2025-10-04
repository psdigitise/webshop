frappe.pages['cart-management-details'] = {
    title: 'Cart Management Details',
    route: 'cart-management/:sales_order',
    content: function(wrapper) {
        frappe.require('cart_management_details.js', function() {
            frappe.cart_management_details.make(wrapper);
        });
    }
};
