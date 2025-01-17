document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("inputEmail").value;
    const password = document.getElementById("inputPassword").value;

    try {
        const response = await fetch('/api/users/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        // Kiểm tra trạng thái phản hồi
        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem("token", data.token); // Lưu JWT vào localStorage

            // Điều hướng dựa trên role
            if (data.user.role === "admin") {
                window.location.href = "/adminPage";
            } else {
                alert("Access denied! You are not authorized to access admin pages.");
            }
        } else {
            // Hiển thị thông báo lỗi
            alert(data.message || "Invalid email or password. Please try again.");
            // Không xóa dữ liệu trong textfield để người dùng chỉnh sửa
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again later.");
    }
});

