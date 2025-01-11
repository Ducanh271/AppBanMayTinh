async function loadOrders() {
    try {
        const response = await fetch('http://localhost:3000/api/orders');
        const orders = await response.json();

        if (response.ok) {
            const orderList = document.getElementById('order-list');
            orderList.innerHTML = ''; // Xóa danh sách cũ

            orders.forEach(order => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.dataset.orderId = order._id;

                const orderInfo = document.createElement('div');
                orderInfo.innerHTML = `
                    <strong>Order ID:</strong> ${order._id}<br>
                    <strong>Status:</strong> <span class="order-status">${order.status}</span><br>
                    <strong>Total Price:</strong> $${order.totalPrice || 0}
                `;

                // Nút "Mark as Shipping"
                const shipButton = document.createElement('button');
                shipButton.className = 'btn btn-primary btn-sm me-2';
                shipButton.textContent = order.status === 'pending' ? 'Mark as Shipping' : 'Already Shipped';
                shipButton.disabled = order.status !== 'pending';

                shipButton.addEventListener('click', () => updateOrderStatus(order._id));

                // Nút "Cancel Order"
                const cancelButton = document.createElement('button');
                cancelButton.className = 'btn btn-danger btn-sm';
                cancelButton.textContent = 'Cancel Order';
                cancelButton.disabled = order.status !== 'pending'; // Chỉ cho phép hủy đơn khi trạng thái là "Pending"

                cancelButton.addEventListener('click', () => cancelOrder(order._id));

                li.appendChild(orderInfo);
                li.appendChild(shipButton);
                li.appendChild(cancelButton);
                orderList.appendChild(li);
            });
        } else {
            console.error('Error fetching orders:', orders.message);
            alert('Failed to load orders.');
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('An error occurred while loading orders.');
    }
}

// Hàm cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId) {
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'shipping' }) // Cập nhật trạng thái
        });

        if (response.ok) {
            alert('Order status updated to Shipping!');
            loadOrders(); // Tải lại danh sách đơn hàng
        } else {
            const error = await response.json();
            console.error('Error updating order:', error.message);
            alert('Failed to update order status.');
        }
    } catch (error) {
        console.error('Error updating order:', error);
        alert('An error occurred while updating the order.');
    }
}
// hàm hủy đơn
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            method: 'DELETE', // Gửi yêu cầu xóa
        });

        if (response.ok) {
            alert('Order has been canceled successfully!');
            loadOrders(); // Tải lại danh sách đơn hàng
        } else {
            const error = await response.json();
            console.error('Error canceling order:', error.message);
            alert('Failed to cancel the order.');
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        alert('An error occurred while canceling the order.');
    }
}

// Khởi tạo khi DOM được tải
document.addEventListener('DOMContentLoaded', loadOrders);