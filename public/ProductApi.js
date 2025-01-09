async function loadProducts() {
       try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();

        if (response.ok) {
            const productList = document.getElementById('product-list');
            productList.innerHTML = ''; // Xóa danh sách cũ
            data.products.forEach(product => loadProductFrontEnd(product));
        } else {
            console.error('Error fetching products:', data.message);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function loadProductFrontEnd(product) {
    const productList = document.getElementById('product-list');

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';
    li.dataset.productId = product._id;

    const productInfo = document.createElement('div');
    productInfo.className = 'd-flex align-items-center';

    const img = document.createElement('img');
    img.src = product.image || 'https://via.placeholder.com/100';
    img.alt = product.title || 'No title available';
    img.style.maxWidth = '100px';
    img.style.marginRight = '15px';

    const text = document.createElement('div');
    text.innerHTML = `
        <strong>${product.title}</strong><br>
        Price: $${product.price}<br>
        ${product.description}<br>
        Category: ${product.category}
    `;

    productInfo.appendChild(img);
    productInfo.appendChild(text);

    const actionButtons = document.createElement('div');

    const editButton = document.createElement('button');
    editButton.className = 'btn btn-warning btn-sm me-2';
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';

    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);

    li.appendChild(productInfo);
    li.appendChild(actionButtons);

    productList.appendChild(li);
}

document.getElementById('product-list').addEventListener('click', (e) => {
    const target = e.target;
    const listItem = target.closest('li');
    const productId = listItem?.dataset.productId;

    if (target.classList.contains('btn-warning')) {
        console.log('Edit button clicked for product:', productId);
        editProduct(productId);
    } else if (target.classList.contains('btn-danger')) {
        console.log('Delete button clicked for product:', productId);
        deleteProduct(productId, listItem);
    }
});

function deleteProduct(productId, listItem) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    listItem.remove();
                    alert('Product deleted successfully!');
                } else {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Failed to delete product.');
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('An error occurred while deleting the product.');
            });
    }
}
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();

        if (response.ok) {
            // Hiển thị modal chỉnh sửa
            const modal = document.getElementById('edit-product-modal');
            modal.style.display = 'flex';

            // Điền dữ liệu vào form chỉnh sửa
            document.getElementById('edit-product-title').value = product.title;
            document.getElementById('edit-product-price').value = product.price;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-category').value = product.category;
            document.getElementById('edit-product-image').value = product.image;

            // Xử lý lưu thay đổi khi người dùng submit form
            document.getElementById('edit-product-form').onsubmit = async function (event) {
                event.preventDefault();

                const updatedProduct = {
                    title: document.getElementById('edit-product-title').value,
                    price: parseFloat(document.getElementById('edit-product-price').value),
                    description: document.getElementById('edit-product-description').value,
                    category: document.getElementById('edit-product-category').value,
                    image: document.getElementById('edit-product-image').value,
                };

                try {
                    const updateResponse = await fetch(`/api/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatedProduct),
                    });

                    if (updateResponse.ok) {
                        alert('Product updated successfully!');
                        location.reload();
                    } else {
                        alert('Failed to update product.');
                    }
                } catch (error) {
                    console.error('Error updating product:', error);
                    alert('An error occurred while updating the product.');
                }

                modal.style.display = 'none';
            };
        } else {
            console.error('Failed to fetch product for editing:', product.message);
        }
    } catch (error) {
        console.error('Error fetching product for editing:', error);
    }
}


async function addProduct(event) {
    event.preventDefault();

    // Lấy giá trị từ form
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const category = document.getElementById('product-category').value;
    const image = document.getElementById('product-image').value;

    // Kiểm tra dữ liệu hợp lệ
    if (!title || !price || !description || !category || !image) {
        alert('All fields are required!');
        return;
    }

    const newProduct = {
        title,
        price,
        description,
        category,
        image,
    };

    // Gửi yêu cầu POST đến API để thêm sản phẩm
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newProduct),
        });

        if (response.ok) {
            alert('Product added successfully!');
            location.reload(); // Tải lại danh sách sản phẩm
        } else {
            alert('Failed to add product.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('An error occurred while adding the product.');
    }

    // Đóng modal sau khi thêm sản phẩm
    document.getElementById('add-product-modal').style.display = 'none';
}
async function searchProducts(keyword) {
    if (!keyword.trim()) {
        console.error('Search keyword is empty.');
        return alert('Vui lòng nhập từ khóa tìm kiếm.');
    }

    try {
        // Hiển thị trạng thái đang tải
        showLoading();

        const response = await fetch(`/api/products/search?query=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        hideLoading();

        if (response.ok) {
            if (data.products.length > 0) {
                renderProducts(data.products); // Hiển thị danh sách sản phẩm
            } else {
                alert('Không tìm thấy sản phẩm nào phù hợp với từ khóa.');
            }
        } else {
            console.error('Error searching products:', data.message);
            alert(`Lỗi: ${data.message}`);
        }
    } catch (error) {
        hideLoading();
        console.error('Error searching products:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const paginationContainer = document.querySelector(".pagination");
    const maxVisiblePages = 4; // Số trang hiển thị tối đa
    let currentPage = 1;
    let totalPages = 1; // Tổng số trang, lấy từ API khi tải dữ liệu

    // Hàm lấy danh sách sản phẩm từ API và cập nhật phân trang
    async function fetchProducts(page) {
        try {
           
                        const response = await fetch(`/api/products?page=${page}&limit=10`);
            const data = await response.json();

            if (response.ok) {
                totalPages = Math.ceil(data.total / data.limit); // Cập nhật tổng số trang
                renderProducts(data.products); // Hiển thị sản phẩm
                updatePagination(); // Cập nhật phân trang
            } else {
                console.error("Error fetching products:", data.message);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // Hàm hiển thị danh sách sản phẩm
    function renderProducts(products) {
        const productList = document.getElementById("product-list");
        productList.innerHTML = ""; // Xóa danh sách cũ

        products.forEach(product => loadProductFrontEnd(product)); // Hiển thị từng sản phẩm
    }

    // Hàm cập nhật giao diện phân trang
    function updatePagination() {
        const prevPage = document.getElementById("prev-page");
        const nextPage = document.getElementById("next-page");

        // Xóa các trang hiện tại (giữ lại nút Prev và Next)
        paginationContainer.querySelectorAll(".page-item:not(#prev-page):not(#next-page)").forEach(item => item.remove());

        // Tính toán phạm vi các trang hiển thị
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

              // Thêm các nút trang mới
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener("click", (e) => {
                e.preventDefault();
                if (i !== currentPage) {
                    currentPage = i;
                    fetchProducts(currentPage); // Tải lại dữ liệu cho trang hiện tại
                }
            });
            paginationContainer.insertBefore(pageItem, nextPage); // Chèn trước nút Next
        }

        // Vô hiệu hóa nút Previous/Next khi cần
        prevPage.classList.toggle("disabled", currentPage === 1);
        nextPage.classList.toggle("disabled", currentPage === totalPages);
    }

    // Sự kiện cho nút Prev và Next
    document.getElementById("prev-page").addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchProducts(currentPage);
        }
    });

    document.getElementById("next-page").addEventListener("click", (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            fetchProducts(currentPage);
        }
    });

    // Khởi tạo dữ liệu lần đầu
    fetchProducts(currentPage);
});

//=======================================Xử lý EVENT  ===============================================

document.getElementById('add-product').addEventListener('click', () => {
    addProduct();
});

//sự kiện cho nút add product
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    document.getElementById('add-product').addEventListener('click', function () {
        document.getElementById('add-product-modal').style.display = 'flex';
    });

    document.getElementById('close-modal').addEventListener('click', function () {
        document.getElementById('add-product-modal').style.display = 'none';
    });

    document.getElementById('product-form').addEventListener('submit', async function (event) {
        addProduct(event);
    });
});
//su kien dong edit form
document.getElementById('close-edit-modal').addEventListener('click', () => {
    document.getElementById('edit-product-modal').style.display = 'none';
});
//sự kiện ô tìm kiếm
document.getElementById('btnNavbarSearch').addEventListener('click', () => {
    const keyword = document.querySelector('.form-control[placeholder="Search for..."]').value.trim();
    if (keyword) {
        searchProducts(keyword);
    } else {
        loadProducts(); // Tải lại danh sách tất cả sản phẩm nếu không có từ khóa
    }
});
//sự kiện nhấn enter của ô tìm kiếm 
document.querySelector('.form-control[placeholder="Search for..."]').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const keyword = event.target.value.trim();
        if (keyword) {
            searchProducts(keyword);
        } else {
            loadProducts();
        }
    }
});

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

