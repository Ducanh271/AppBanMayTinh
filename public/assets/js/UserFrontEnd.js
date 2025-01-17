
// Hàm load tất cả người dùng
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();

        if (response.ok) {
            const userList = document.getElementById('user-list');
            userList.innerHTML = ''; // Xóa danh sách hiện tại

            // Kiểm tra xem data có phải là mảng không
            if (Array.isArray(data)) {
                data.forEach(user => loadUserFrontEnd(user));
            } else {
                console.warn('No users found or invalid response format.');
            }
        } else {
            console.error('Error fetching users:', data.message);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Hàm tải thông tin người dùng vào frontend
async function loadUserFrontEnd(user) {
    const userList = document.getElementById('user-list');

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';
    li.dataset.userId = user._id;

    const userInfo = document.createElement('div');
    userInfo.className = 'd-flex align-items-center';

    const text = document.createElement('div');
    text.innerHTML = `
        UserName: <strong>${user.name}</strong><br>
        Email: ${user.email}<br>
        Password: ${user.password}<br>
        Created At: ${user.createdAt}<br>
    `;

    userInfo.appendChild(text);

    const actionButtons = document.createElement('div');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';

    actionButtons.appendChild(deleteButton);

    li.appendChild(userInfo);
    li.appendChild(actionButtons);

    userList.appendChild(li);
}

// Lắng nghe sự kiện xóa người dùng
const userListElement = document.getElementById('user-list');
userListElement.addEventListener('click', (e) => {
    const target = e.target;
    const listItem = target.closest('li');
    const userId = listItem?.dataset.userId;

    if (target.classList.contains('btn-danger')) {
        console.log('Delete button clicked for user:', userId);
        deleteUser(userId, listItem);
    }
});

// Hàm xóa người dùng
function deleteUser(userId, listItem) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/api/users/${userId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    listItem.remove();
                    alert('User deleted successfully!');
                } else {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Failed to delete user.');
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('An error occurred while deleting the user.');
            });
    }
}

// Hàm phân trang và lấy dữ liệu người dùng
async function fetchUsers(page) {
    try {
        const response = await fetch(`/api/users?page=${page}&limit=10`);
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
            totalPages = Math.ceil(data.length / 10); // Cập nhật số trang
            renderUsers(data);
            updatePagination();
        } else {
            console.error("Invalid API response:", data);
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

function renderUsers(users) {
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    users.forEach(user => loadUserFrontEnd(user));
}

function updatePagination() {
    const prevPage = document.getElementById("prev-page");
    const nextPage = document.getElementById("next-page");
    const paginationContainer = document.querySelector(".pagination");

    paginationContainer.querySelectorAll(".page-item:not(#prev-page):not(#next-page)").forEach(item => item.remove());

    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            if (i !== currentPage) {
                currentPage = i;
                fetchUsers(currentPage);
            }
        });
        paginationContainer.insertBefore(pageItem, nextPage);
    }

    prevPage.classList.toggle("disabled", currentPage === 1);
    nextPage.classList.toggle("disabled", currentPage === totalPages);
}

// Sự kiện cho Prev/Next pagination
document.getElementById("prev-page").addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
        currentPage--;
        fetchUsers(currentPage);
    }
});

document.getElementById("next-page").addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
        currentPage++;
        fetchUsers(currentPage);
    }
});

// Khởi tạo khi DOM được tải xong
document.addEventListener("DOMContentLoaded", () => {
    const paginationContainer = document.querySelector(".pagination");
    const maxVisiblePages = 4;
    let currentPage = 1;
    let totalPages = 1;

    loadUsers();  // Tải người dùng
    fetchUsers(currentPage);  // Tải người dùng cho trang hiện tại
    updatePagination();  // Cập nhật phân trang
});
