frappe.pages['admin-dashboard'].on_page_load = function (wrapper) {
	let page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Admin Approval Dashboard',
		single_column: true
	});

	// Add container
	$(frappe.render_template("admin_dashboard", {})).appendTo(page.body);

	// Load dashboard data
	load_admin_dashboard(page);
};

function load_admin_dashboard(page) {
	let container = page.body.find('#admin-dashboard');
	container.html(`<div class="text-muted p-3">Loading data...</div>`);

	frappe.call({
		method: "webshop.dasboard.get_web_user_dashboard",
		freeze: true,
		freeze_message: __("Loading dashboard..."),
		callback: function (r) {
			container.empty();

			if (!r.message) {
				container.html(`<div class="text-danger">No data returned.</div>`);
				return;
			}

			const { role, pending_approvals } = r.message;

			if (role === "Level 1 Admin" || role === "Level 2 Admin") {
				container.append(`<h3 class="mb-3">${role} - Pending Approvals</h3>`);

				if (pending_approvals && pending_approvals.length) {
					let table = `
						<table class="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Customer</th>
									<th>Total</th>
									<th>Workflow State</th>
									<th class="text-center">Action</th>
								</tr>
							</thead>
							<tbody>
								${pending_approvals.map(o => `
									<tr>
										<td><a href="/app/sales-order/${o.name}" target="_blank">${o.name}</a></td>
										<td>${o.customer_name}</td>
										<td>${o.grand_total}</td>
										<td>${o.workflow_state}</td>
										<td class="text-center"><a href="/app/sales-order/${o.name}" target="_blank"><button class="btn btn-sm btn-info" >view</button></a></td>
										<!--<td>
										// 	<button class="btn btn-sm btn-success" data-order="${o.name}" data-action="approve">Approve</button>
										// 	<button class="btn btn-sm btn-danger" data-order="${o.name}" data-action="reject">Reject</button>
										// </td>-->
									</tr>
								`).join('')}
							</tbody>
						</table>`;
					container.append(table);

					// Add action listeners
					// container.find("button").on("click", function () {
					// 	const order = $(this).data("order");
					// 	const action = $(this).data("action");
					// 	handle_order_action(order, action);
					// });
				} else {
					container.append(`<div class="text-muted">No pending approvals found.</div>`);
				}
			} else {
				container.html(`<div class="text-danger">You are not authorized to view this dashboard.</div>`);
			}
		}
	});
}

function handle_order_action(order, action) {
	frappe.call({
		method: "webshop.dasboard.update_order_workflow_state",
		args: {
			order_id: order,
			action: action
		},
		freeze: true,
		freeze_message: __("Processing..."),
		callback: function (r) {
			if (!r.exc) {
				frappe.msgprint(__(`Order ${order} has been ${action}d successfully.`));
				frappe.pages['admin-dashboard'].refresh();
			}
		}
	});
}
