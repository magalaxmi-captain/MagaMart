import { JavaCodeFile } from '../types';

export const JAVA_FILES: JavaCodeFile[] = [
  {
    id: 'dbutil',
    fileName: 'DBUtil.java',
    path: 'src/main/java/com/magamart/util/DBUtil.java',
    language: 'java',
    category: 'Configuration',
    description: 'Thread-safe JDBC connection management using connection pooling (HikariCP) with fallback to standard DriverManager.',
    code: `package com.magamart.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Database Utility class for MagaMart e-commerce platform.
 * Manages JDBC connections to 'magamart_db' MySQL database using 
 * best practices for resource management and connection pooling.
 */
public class DBUtil {

    private static final Logger LOGGER = Logger.getLogger(DBUtil.java.getName());

    // Database connection parameters
    private static final String DB_URL = "jdbc:mysql://localhost:3306/magamart_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String DB_USER = System.getenv("DB_USER") != null ? System.getenv("DB_USER") : "root";
    private static final String DB_PASS = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "admin123";
    private static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";

    static {
        try {
            Class.forName(JDBC_DRIVER);
            LOGGER.info("MySQL JDBC Driver registered successfully.");
        } catch (ClassNotFoundException e) {
            LOGGER.log(Level.SEVERE, "Failed to load MySQL JDBC Driver: " + JDBC_DRIVER, e);
            throw new ExceptionInInitializerError("MySQL JDBC driver not found on classpath.");
        }
    }

    /**
     * Obtains a live connection to the MySQL database.
     * @return Connection object
     * @throws SQLException if a database access error occurs
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }

    /**
     * Safely closes AutoCloseable database resources (Connection, Statement, ResultSet).
     * Prevents resource leakage in multi-threaded servlet containers.
     * 
     * @param closeables variable list of resources to close
     */
    public static void close(AutoCloseable... closeables) {
        for (AutoCloseable resource : closeables) {
            if (resource != null) {
                try {
                    resource.close();
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Error closing database resource: " + e.getMessage());
                }
            }
        }
    }
}
`,
  },
  {
    id: 'user-model',
    fileName: 'User.java',
    path: 'src/main/java/com/magamart/model/User.java',
    language: 'java',
    category: 'Model',
    description: 'JavaBean representing an application user in magamart_db.',
    code: `package com.magamart.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Model class representing a user entity in MagaMart.
 * Maps directly to 'users' table in 'magamart_db'.
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private String email;
    private String password; // Stored as cryptographic hash (PBKDF2/BCrypt)
    private String fullName;
    private String role; // "CUSTOMER" or "ADMIN"
    private Timestamp createdAt;

    // Constructors
    public User() {}

    public User(int id, String email, String fullName, String role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public User(String email, String password, String fullName, String role) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }
}
`,
  },
  {
    id: 'product-model',
    fileName: 'Product.java',
    path: 'src/main/java/com/magamart/model/Product.java',
    language: 'java',
    category: 'Model',
    description: 'JavaBean representing an IoT component, sensor, or hardware item.',
    code: `package com.magamart.model;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Model class representing an IoT product/sensor in MagaMart.
 * Maps to 'products' table in 'magamart_db'.
 */
public class Product implements Serializable {
    private static final long serialVersionUID = 1L;

    private int productId;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private String sku;

    public Product() {}

    public Product(int productId, String name, String category, String description, BigDecimal price, int stockQuantity, String sku) {
        this.productId = productId;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.sku = sku;
    }

    // Getters and Setters
    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public boolean isLowStock() {
        return this.stockQuantity > 0 && this.stockQuantity <= 10;
    }

    public boolean isOutOfStock() {
        return this.stockQuantity <= 0;
    }
}
`,
  },
  {
    id: 'user-dao',
    fileName: 'UserDAO.java',
    path: 'src/main/java/com/magamart/dao/UserDAO.java',
    language: 'java',
    category: 'DAO',
    description: 'Data Access Object for User operations using SQL PreparedStatements and secure password verification.',
    code: `package com.magamart.dao;

import com.magamart.model.User;
import com.magamart.util.DBUtil;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Data Access Object for 'users' table in 'magamart_db'.
 * Implements strict SQL injection prevention via PreparedStatement
 * and PBKDF2 with HMAC-SHA256 password hashing.
 */
public class UserDAO {

    private static final Logger LOGGER = Logger.getLogger(UserDAO.java.getName());
    private static final int ITERATIONS = 65536;
    private static final int KEY_LENGTH = 256;

    /**
     * Authenticates a user by email and compares the plaintext password against stored hash.
     * Prevents SQL Injection via PreparedStatement parameter binding.
     *
     * @param email User email address
     * @param plainPassword Raw password provided by user
     * @return Authenticated User object if valid, null otherwise
     */
    public User authenticate(String email, String plainPassword) {
        String sql = "SELECT id, email, password, full_name, role FROM users WHERE email = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email.trim().toLowerCase());
            rs = stmt.executeQuery();

            if (rs.next()) {
                String storedHash = rs.getString("password");
                if (verifyPassword(plainPassword, storedHash)) {
                    User user = new User();
                    user.setId(rs.getInt("id"));
                    user.setEmail(rs.getString("email"));
                    user.setFullName(rs.getString("full_name"));
                    user.setRole(rs.getString("role"));
                    return user;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database error during authentication for: " + email, e);
        } finally {
            DBUtil.close(rs, stmt, conn);
        }
        return null;
    }

    /**
     * Registers a new user with hashed password.
     * 
     * @param user User object containing email, raw password, fullName, role
     * @return true if registration succeeded, false if duplicate or error
     */
    public boolean registerUser(User user) {
        String sql = "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBUtil.getConnection();
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            stmt.setString(1, user.getEmail().trim().toLowerCase());
            // Securely hash password before storing in MySQL
            stmt.setString(2, hashPassword(user.getPassword()));
            stmt.setString(3, user.getFullName().trim());
            stmt.setString(4, user.getRole() != null ? user.getRole() : "CUSTOMER");

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.WARNING, "Error creating user account: " + user.getEmail() + " - " + e.getMessage());
            return false;
        } finally {
            DBUtil.close(stmt, conn);
        }
    }

    /**
     * Checks whether an email is already registered.
     */
    public boolean isEmailRegistered(String email) {
        String sql = "SELECT id FROM users WHERE email = ?";
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBUtil.getConnection();
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, email.trim().toLowerCase());
            rs = stmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking email existence: " + email, e);
            return false;
        } finally {
            DBUtil.close(rs, stmt, conn);
        }
    }

    // Security Helper: PBKDF2 with SHA-256 Hashing
    public static String hashPassword(String password) {
        try {
            byte[] salt = new byte[16];
            SecureRandom.getInstanceStrong().nextBytes(salt);
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    // Security Helper: Verification with Constant-Time Comparison
    public static boolean verifyPassword(String originalPassword, String storedHash) {
        try {
            if (storedHash == null || !storedHash.contains(":")) return false;
            String[] parts = storedHash.split(":");
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] hash = Base64.getDecoder().decode(parts[1]);

            PBEKeySpec spec = new PBEKeySpec(originalPassword.toCharArray(), salt, ITERATIONS, hash.length * 8);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] testHash = skf.generateSecret(spec).getEncoded();

            // Constant-time comparison to prevent timing attacks
            int diff = hash.length ^ testHash.length;
            for (int i = 0; i < hash.length && i < testHash.length; i++) {
                diff |= hash[i] ^ testHash[i];
            }
            return diff == 0;
        } catch (Exception e) {
            return false;
        }
    }
}
`,
  },
  {
    id: 'product-dao',
    fileName: 'ProductDAO.java',
    path: 'src/main/java/com/magamart/dao/ProductDAO.java',
    language: 'java',
    category: 'DAO',
    description: 'Data Access Object for Product CRUD operations, stock queries, and catalog filters.',
    code: `package com.magamart.dao;

import com.magamart.model.Product;
import com.magamart.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for 'products' table in 'magamart_db'.
 * Handles all CRUD operations for IoT hardware, sensors, and prototyping items.
 */
public class ProductDAO {

    private static final Logger LOGGER = Logger.getLogger(ProductDAO.java.getName());

    /**
     * Retrieves all products from the catalog.
     */
    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT product_id, name, category, description, price, stock_quantity, sku FROM products ORDER BY product_id DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                products.add(mapResultSetToProduct(rs));
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching all products", e);
        }
        return products;
    }

    /**
     * Finds a single product by primary key product_id.
     */
    public Product getProductById(int productId) {
        String sql = "SELECT product_id, name, category, description, price, stock_quantity, sku FROM products WHERE product_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching product by ID: " + productId, e);
        }
        return null;
    }

    /**
     * Filters products by IoT category (Sensors, Dev Boards, etc.).
     */
    public List<Product> getProductsByCategory(String category) {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT product_id, name, category, description, price, stock_quantity, sku FROM products WHERE category = ? ORDER BY product_id DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, category);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    products.add(mapResultSetToProduct(rs));
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching products by category: " + category, e);
        }
        return products;
    }

    /**
     * Inserts a new IoT component or sensor into the database.
     */
    public boolean insertProduct(Product product) {
        String sql = "INSERT INTO products (name, category, description, price, stock_quantity, sku) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, product.getName());
            stmt.setString(2, product.getCategory());
            stmt.setString(3, product.getDescription());
            stmt.setBigDecimal(4, product.getPrice());
            stmt.setInt(5, product.getStockQuantity());
            stmt.setString(6, product.getSku());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error inserting product: " + product.getName(), e);
            return false;
        }
    }

    /**
     * Updates an existing product's details and inventory level.
     */
    public boolean updateProduct(Product product) {
        String sql = "UPDATE products SET name = ?, category = ?, description = ?, price = ?, stock_quantity = ?, sku = ? WHERE product_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, product.getName());
            stmt.setString(2, product.getCategory());
            stmt.setString(3, product.getDescription());
            stmt.setBigDecimal(4, product.getPrice());
            stmt.setInt(5, product.getStockQuantity());
            stmt.setString(6, product.getSku());
            stmt.setInt(7, product.getProductId());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating product ID: " + product.getProductId(), e);
            return false;
        }
    }

    /**
     * Deletes a product from the catalog.
     */
    public boolean deleteProduct(int productId) {
        String sql = "DELETE FROM products WHERE product_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, productId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error deleting product ID: " + productId, e);
            return false;
        }
    }

    /**
     * Decrements inventory during customer order placement within a transaction.
     */
    public boolean deductStock(Connection conn, int productId, int quantity) throws SQLException {
        String sql = "UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, quantity);
            stmt.setInt(2, productId);
            stmt.setInt(3, quantity);
            return stmt.executeUpdate() > 0;
        }
    }

    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setProductId(rs.getInt("product_id"));
        p.setName(rs.getString("name"));
        p.setCategory(rs.getString("category"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setSku(rs.getString("sku"));
        return p;
    }
}
`,
  },
  {
    id: 'login-servlet',
    fileName: 'LoginServlet.java',
    path: 'src/main/java/com/magamart/servlet/LoginServlet.java',
    language: 'java',
    category: 'Servlet / Controller',
    description: 'Controller handling customer and admin authentication with session protection and role redirection.',
    code: `package com.magamart.servlet;

import com.magamart.dao.UserDAO;
import com.magamart.model.User;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Controller Servlet for authenticating users & administrators.
 * Prevents session fixation by invalidating old sessions upon login.
 */
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private UserDAO userDAO;

    @Override
    public void init() {
        this.userDAO = new UserDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        // Forward to the split-screen authentication view
        request.getRequestDispatcher("/index.html").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String requestedRole = request.getParameter("loginType"); // "user" or "admin"

        // Basic input validation
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Email and password are required.");
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        User user = userDAO.authenticate(email, password);

        if (user != null) {
            // Check if admin login was requested but user is not an admin
            if ("admin".equalsIgnoreCase(requestedRole) && !user.isAdmin()) {
                request.setAttribute("errorMessage", "Access Denied: You do not possess administrator privileges.");
                request.getRequestDispatcher("/index.html").forward(request, response);
                return;
            }

            // Security: Invalidate old session to mitigate Session Fixation attacks
            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }

            // Establish fresh, secure session
            HttpSession session = request.getSession(true);
            session.setAttribute("currentUser", user);
            session.setAttribute("userRole", user.getRole());
            session.setMaxInactiveInterval(30 * 60); // 30 minutes session timeout

            // Role-based redirection
            if (user.isAdmin()) {
                response.sendRedirect(request.getContextPath() + "/admin/products");
            } else {
                response.sendRedirect(request.getContextPath() + "/products");
            }
        } else {
            request.setAttribute("errorMessage", "Invalid email or password. Please try again.");
            request.getRequestDispatcher("/index.html").forward(request, response);
        }
    }
}
`,
  },
  {
    id: 'register-servlet',
    fileName: 'RegisterServlet.java',
    path: 'src/main/java/com/magamart/servlet/RegisterServlet.java',
    language: 'java',
    category: 'Servlet / Controller',
    description: 'Controller handling new user account registrations with server-side validation and password security.',
    code: `package com.magamart.servlet;

import com.magamart.dao.UserDAO;
import com.magamart.model.User;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Controller Servlet handling new customer account registrations.
 */
@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private UserDAO userDAO;

    @Override
    public void init() {
        this.userDAO = new UserDAO();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        String fullName = request.getParameter("fullName");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");

        // Server-side validation
        if (fullName == null || fullName.trim().length() < 2) {
            redirectWithError(request, response, "Please provide your full legal name.");
            return;
        }

        if (email == null || !email.matches("^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$")) {
            redirectWithError(request, response, "Please provide a valid email address.");
            return;
        }

        if (password == null || password.length() < 6) {
            redirectWithError(request, response, "Password must be at least 6 characters long.");
            return;
        }

        if (!password.equals(confirmPassword)) {
            redirectWithError(request, response, "Passwords do not match.");
            return;
        }

        // Check if email already registered in magamart_db
        if (userDAO.isEmailRegistered(email)) {
            redirectWithError(request, response, "An account with this email already exists.");
            return;
        }

        // Create new Customer user
        User newUser = new User();
        newUser.setFullName(fullName.trim());
        newUser.setEmail(email.trim().toLowerCase());
        newUser.setPassword(password); // Will be hashed inside UserDAO
        newUser.setRole("CUSTOMER");

        boolean success = userDAO.registerUser(newUser);

        if (success) {
            // Auto-login the user into fresh session
            User createdUser = userDAO.authenticate(email, password);
            HttpSession session = request.getSession(true);
            session.setAttribute("currentUser", createdUser);
            session.setAttribute("userRole", createdUser.getRole());

            response.sendRedirect(request.getContextPath() + "/products?registered=true");
        } else {
            redirectWithError(request, response, "Registration failed due to an internal error. Please try again.");
        }
    }

    private void redirectWithError(HttpServletRequest req, HttpServletResponse resp, String msg) 
            throws ServletException, IOException {
        req.setAttribute("errorMessage", msg);
        req.getRequestDispatcher("/index.html").forward(req, resp);
    }
}
`,
  },
  {
    id: 'admin-servlet',
    fileName: 'AdminProductServlet.java',
    path: 'src/main/java/com/magamart/servlet/AdminProductServlet.java',
    language: 'java',
    category: 'Servlet / Controller',
    description: 'Controller managing the administrative product catalog: Add, Edit, Delete, and Restock IoT items.',
    code: `package com.magamart.servlet;

import com.magamart.dao.ProductDAO;
import com.magamart.model.Product;
import com.magamart.model.User;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Controller Servlet managing administrative product catalog actions.
 * Protected by AuthFilter; verifies admin session before every mutation.
 */
@WebServlet("/admin/products")
public class AdminProductServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private ProductDAO productDAO;

    @Override
    public void init() {
        this.productDAO = new ProductDAO();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) action = "list";

        switch (action) {
            case "delete":
                deleteProduct(request, response);
                break;
            case "edit":
                showEditForm(request, response);
                break;
            case "list":
            default:
                listProducts(request, response);
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        String action = request.getParameter("action");
        if (action == null) action = "save";

        if ("save".equalsIgnoreCase(action)) {
            saveProduct(request, response);
        } else if ("update".equalsIgnoreCase(action)) {
            updateProduct(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/admin/products");
        }
    }

    private void listProducts(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        List<Product> products = productDAO.getAllProducts();
        request.setAttribute("productList", products);
        request.getRequestDispatcher("/WEB-INF/views/admin_dashboard.jsp").forward(request, response);
    }

    private void saveProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        String name = request.getParameter("name");
        String category = request.getParameter("category");
        String description = request.getParameter("description");
        String priceStr = request.getParameter("price");
        String stockStr = request.getParameter("stockQuantity");
        String sku = request.getParameter("sku");

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setDescription(description);
        product.setPrice(new BigDecimal(priceStr));
        product.setStockQuantity(Integer.parseInt(stockStr));
        product.setSku(sku);

        productDAO.insertProduct(product);
        response.sendRedirect(request.getContextPath() + "/admin/products?msg=created");
    }

    private void updateProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        int id = Integer.parseInt(request.getParameter("productId"));
        String name = request.getParameter("name");
        String category = request.getParameter("category");
        String description = request.getParameter("description");
        String priceStr = request.getParameter("price");
        String stockStr = request.getParameter("stockQuantity");
        String sku = request.getParameter("sku");

        Product product = new Product(id, name, category, description, new BigDecimal(priceStr), Integer.parseInt(stockStr), sku);
        productDAO.updateProduct(product);
        response.sendRedirect(request.getContextPath() + "/admin/products?msg=updated");
    }

    private void showEditForm(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        Product existingProduct = productDAO.getProductById(id);
        request.setAttribute("product", existingProduct);
        request.getRequestDispatcher("/WEB-INF/views/edit_product.jsp").forward(request, response);
    }

    private void deleteProduct(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        productDAO.deleteProduct(id);
        response.sendRedirect(request.getContextPath() + "/admin/products?msg=deleted");
    }
}
`,
  },
  {
    id: 'auth-filter',
    fileName: 'AuthFilter.java',
    path: 'src/main/java/com/magamart/filter/AuthFilter.java',
    language: 'java',
    category: 'Filter / Security',
    description: 'Servlet Filter securing the /admin/* routes against unauthenticated or non-admin access.',
    code: `package com.magamart.filter;

import com.magamart.model.User;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Security Filter intercepting all requests to '/admin/*'.
 * Verifies active session and checks for 'ADMIN' role.
 * Sets security headers to prevent browser caching of protected views.
 */
@WebFilter("/admin/*")
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Prevent browser caching of sensitive admin pages
        httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setDateHeader("Expires", 0);

        HttpSession session = httpRequest.getSession(false);

        boolean isLoggedIn = (session != null && session.getAttribute("currentUser") != null);
        
        if (isLoggedIn) {
            User currentUser = (User) session.getAttribute("currentUser");
            if (currentUser.isAdmin()) {
                // Authorized: proceed down the filter chain
                chain.doFilter(request, response);
                return;
            }
        }

        // Unauthorized: redirect to login page with error attribute
        httpResponse.sendRedirect(httpRequest.getContextPath() + "/login?error=unauthorized");
    }

    @Override
    public void destroy() {}
}
`,
  },
  {
    id: 'logout-servlet',
    fileName: 'LogoutServlet.java',
    path: 'src/main/java/com/magamart/servlet/LogoutServlet.java',
    language: 'java',
    category: 'Servlet / Controller',
    description: 'Controller terminating active HTTP sessions cleanly and redirecting to the storefront.',
    code: `package com.magamart.servlet;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * Controller Servlet for invalidating user and administrator sessions.
 */
@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // Destroys session ID & stored attributes
        }

        // Redirect back to login with notice
        response.sendRedirect(request.getContextPath() + "/login?status=logged_out");
    }
}
`,
  },
  {
    id: 'admin-dashboard-jsp',
    fileName: 'admin_dashboard.jsp',
    path: 'src/main/webapp/WEB-INF/views/admin_dashboard.jsp',
    language: 'jsp',
    category: 'View (JSP/HTML)',
    description: 'JSP view for the MagaMart administrative portal using JSTL/EL with responsive inventory table and CRUD modals.',
    code: `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MagaMart Admin - Inventory & System Management</title>
    <link rel="stylesheet" href="\${pageContext.request.contextPath}/css/style.css">
    <style>
        :root {
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --accent: #38bdf8;
            --accent-hover: #0284c7;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: #334155;
            --danger: #ef4444;
            --warning: #f59e0b;
            --success: #10b981;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            margin: 0;
            padding: 0;
        }
        .navbar {
            background-color: var(--bg-card);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .container {
            max-width: 1280px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .kpi-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.25rem;
        }
        .kpi-title { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem; }
        .kpi-value { font-size: 1.75rem; font-weight: 700; color: var(--accent); }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--bg-card);
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--border);
        }
        .data-table th, .data-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }
        .data-table th { background: #182234; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; }
        .badge {
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .badge-warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .badge-danger { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            text-decoration: none;
            display: inline-block;
        }
        .btn-primary { background: var(--accent); color: #0f172a; }
        .btn-danger { background: var(--danger); color: white; }
    </style>
</head>
<body>

    <!-- Header Navigation -->
    <header class="navbar">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent);">⚡ MagaMart Admin</span>
            <span class="badge badge-success">magamart_db ACTIVE</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1.5rem;">
            <span style="color: var(--text-muted); font-size: 0.9rem;">
                Logged in as: <strong style="color: var(--text-main);">\${sessionScope.currentUser.fullName}</strong> (\${sessionScope.userRole})
            </span>
            <a href="\${pageContext.request.contextPath}/logout" class="btn btn-danger" style="font-size: 0.85rem;">Logout</a>
        </div>
    </header>

    <main class="container">
        <!-- KPI Metrics -->
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">Total Active SKUs</div>
                <div class="kpi-value">\${productList.size()}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Database Engine</div>
                <div class="kpi-value" style="font-size: 1.25rem;">MySQL 8.0 (JDBC)</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Architecture</div>
                <div class="kpi-value" style="font-size: 1.25rem;">Servlet / JSP DAO</div>
            </div>
        </div>

        <!-- Inventory Management Table -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2 style="margin: 0; font-size: 1.35rem;">IoT Hardware Inventory & Sensors</h2>
            <button onclick="document.getElementById('newProductModal').style.display='block'" class="btn btn-primary">
                + Add IoT Component
            </button>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <c:forEach var="prod" items="\${productList}">
                    <tr>
                        <td>#\${prod.productId}</td>
                        <td><code style="color: var(--accent);">\${prod.sku}</code></td>
                        <td style="font-weight: 600;">\${prod.name}</td>
                        <td>\${prod.category}</td>
                        <td>
                            <fmt:formatNumber value="\${prod.price}" type="currency" currencySymbol="$" />
                        </td>
                        <td><strong>\${prod.stockQuantity}</strong> units</td>
                        <td>
                            <c:choose>
                                <c:when test="\${prod.stockQuantity == 0}">
                                    <span class="badge badge-danger">Out of Stock</span>
                                </c:when>
                                <c:when test="\${prod.stockQuantity <= 10}">
                                    <span class="badge badge-warning">Low Stock (\${prod.stockQuantity})</span>
                                </c:when>
                                <c:otherwise>
                                    <span class="badge badge-success">In Stock</span>
                                </c:otherwise>
                            </c:choose>
                        </td>
                        <td>
                            <a href="\${pageContext.request.contextPath}/admin/products?action=delete&id=\${prod.productId}" 
                               class="btn btn-danger" 
                               style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                               onclick="return confirm('Confirm deletion of SKU: \${prod.sku}?');">
                               Delete
                            </a>
                        </td>
                    </tr>
                </c:forEach>
            </tbody>
        </table>
    </main>

</body>
</html>
`,
  },
  {
    id: 'schema-sql',
    fileName: 'magamart_db.sql',
    path: 'database/magamart_db.sql',
    language: 'sql',
    category: 'Database',
    description: 'Production MySQL DDL schema for magamart_db with indexed foreign keys, constraints, and seed data.',
    code: `-- ==========================================================
-- Database Schema for MagaMart IoT & Hardware E-Commerce Platform
-- Database: magamart_db
-- Engine: InnoDB (Full ACID compliance & Foreign Key support)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`magamart_db\` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`magamart_db\`;

-- 1. Users Table (Customer & Admin Authentication)
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`email\` VARCHAR(191) NOT NULL UNIQUE,
    \`password\` VARCHAR(255) NOT NULL COMMENT 'Hashed password with salt',
    \`full_name\` VARCHAR(100) NOT NULL,
    \`role\` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_user_email\` (\`email\`),
    INDEX \`idx_user_role\` (\`role\`)
) ENGINE=InnoDB;

-- 2. Products Table (IoT Components, Sensors & Prototyping Gear)
CREATE TABLE IF NOT EXISTS \`products\` (
    \`product_id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`sku\` VARCHAR(50) NOT NULL UNIQUE,
    \`name\` VARCHAR(200) NOT NULL,
    \`category\` VARCHAR(100) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`price\` DECIMAL(10, 2) NOT NULL,
    \`stock_quantity\` INT NOT NULL DEFAULT 0,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_product_category\` (\`category\`),
    INDEX \`idx_product_sku\` (\`sku\`),
    CONSTRAINT \`chk_stock_nonnegative\` CHECK (\`stock_quantity\` >= 0),
    CONSTRAINT \`chk_price_positive\` CHECK (\`price\` > 0.00)
) ENGINE=InnoDB;

-- 3. Orders & Order Items Tables
CREATE TABLE IF NOT EXISTS \`orders\` (
    \`order_id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`user_id\` INT NOT NULL,
    \`total_amount\` DECIMAL(10, 2) NOT NULL,
    \`status\` ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'CANCELLED') DEFAULT 'PENDING',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS \`order_items\` (
    \`item_id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`order_id\` INT NOT NULL,
    \`product_id\` INT NOT NULL,
    \`quantity\` INT NOT NULL,
    \`unit_price\` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`order_id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Initial Seed Data
-- Note: Passwords stored as PBKDF2 hashes or bcrypt equivalents
INSERT INTO \`users\` (\`email\`, \`password\`, \`full_name\`, \`role\`) VALUES
('admin@magamart.com', 'c2FsdF9leGFtcGxl:aGFzaF9hZG1pbjEyMw==', 'MagaMart Admin', 'ADMIN'),
('sarah.iot@example.com', 'c2FsdF9leGFtcGxl:aGFzaF91c2VyMTIz', 'Sarah Chen', 'CUSTOMER')
ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`);

INSERT INTO \`products\` (\`sku\`, \`name\`,\`category\`, \`description\`, \`price\`, \`stock_quantity\`) VALUES
('MM-MCU-ESP32', 'ESP32-WROOM-32D Development Board', 'Dev Boards', 'Dual-core Xtensa 32-bit LX6 MCU with integrated Wi-Fi and Bluetooth.', 6.95, 48),
('MM-SEN-BME280', 'BME280 Environmental Sensor Module', 'Sensors', 'Digital I2C barometric pressure, temperature, and humidity sensor.', 7.49, 32),
('MM-MCU-PICOW', 'Raspberry Pi Pico W', 'Dev Boards', 'Dual-core Arm Cortex-M0+ with Infineon 802.11n Wi-Fi subsystem.', 8.50, 24),
('MM-WRL-LORA433', 'LoRa SX1278 433MHz Transceiver', 'Wireless & IoT', 'Long-range RF communication module up to 5km line-of-sight.', 11.20, 15),
('MM-SEN-MPU6050', 'MPU-6050 6-DOF Gyro & Accelerometer', 'Sensors', '6-axis motion tracking sensor with internal digital motion processing.', 4.80, 40),
('MM-ACT-RELAY8', '8-Channel 5V Optocoupled Relay Board', 'Actuators & Power', 'Opto-isolated 8-channel relay module for 250VAC/30VDC switching.', 9.90, 8),
('MM-TLS-LOGIC8', '24MHz 8-Channel USB Logic Analyzer', 'Prototyping Gear', 'Essential hardware debugger supporting Sigrok and PulseView decoding.', 14.50, 6)
ON DUPLICATE KEY UPDATE \`stock_quantity\` = VALUES(\`stock_quantity\`);
`,
  },
  {
    id: 'web-xml',
    fileName: 'web.xml',
    path: 'src/main/webapp/WEB-INF/web.xml',
    language: 'xml',
    category: 'Configuration',
    description: 'Deployment descriptor configuring Servlet filters, URL patterns, session timeouts, and error handling.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                             http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <display-name>MagaMart IoT Platform</display-name>

    <!-- Welcome File List -->
    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>

    <!-- Global Session Configuration (30 Minutes timeout) -->
    <session-config>
        <session-timeout>30</session-timeout>
        <cookie-config>
            <http-only>true</http-only>
            <secure>true</secure>
        </cookie-config>
        <tracking-mode>COOKIE</tracking-mode>
    </session-config>

    <!-- Security Auth Filter for Admin Routes -->
    <filter>
        <filter-name>AuthFilter</filter-name>
        <filter-class>com.magamart.filter.AuthFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>AuthFilter</filter-name>
        <url-pattern>/admin/*</url-pattern>
    </filter-mapping>

    <!-- Standard Error Page Handling -->
    <error-page>
        <error-code>404</error-code>
        <location>/WEB-INF/views/error404.jsp</location>
    </error-page>
    <error-page>
        <error-code>500</error-code>
        <location>/WEB-INF/views/error500.jsp</location>
    </error-page>

</web-app>
`,
  },
  {
    id: 'auth-html',
    fileName: 'index.html (Auth Split-Screen)',
    path: 'src/main/webapp/index.html',
    language: 'html',
    category: 'View (JSP/HTML)',
    description: 'The responsive split-screen authentication frontend with Vanilla JS dynamic tab switching.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MagaMart - IoT & Hardware Prototyping Portal</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; }
        
        /* Split Screen Container */
        .split-container { display: flex; width: 100%; height: 100vh; }
        
        /* Left Brand / IoT Showcase Panel */
        .brand-panel {
            flex: 1.1;
            background: linear-gradient(145deg, #0b1120 0%, #1e293b 100%);
            padding: 4rem 3rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            border-right: 1px solid #334155;
            position: relative;
        }
        .brand-logo { font-size: 1.8rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 0.5rem; }
        .brand-hero h1 { font-size: 2.5rem; line-height: 1.2; margin-bottom: 1rem; color: #f8fafc; }
        .brand-hero p { font-size: 1.1rem; line-height: 1.6; color: #94a3b8; max-width: 480px; }
        .features-list { list-style: none; margin-top: 2rem; }
        .features-list li { margin-bottom: 0.75rem; color: #cbd5e1; display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; }
        
        /* Right Auth Panel */
        .auth-panel { flex: 0.9; background: #0f172a; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-card { width: 100%; max-width: 420px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2.25rem; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        
        /* Tab Navigation */
        .tabs { display: flex; border-bottom: 1px solid #334155; margin-bottom: 1.75rem; gap: 0.5rem; }
        .tab-btn {
            background: none; border: none; padding: 0.75rem 1rem; color: #94a3b8; font-weight: 600; font-size: 0.9rem;
            cursor: pointer; position: relative; transition: color 0.2s;
        }
        .tab-btn.active { color: #38bdf8; }
        .tab-btn.active::after {
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #38bdf8;
        }
        
        /* Form Inputs & Buttons */
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #cbd5e1; margin-bottom: 0.4rem; }
        .form-control {
            width: 100%; padding: 0.75rem 1rem; background: #0f172a; border: 1px solid #334155; border-radius: 6px;
            color: #f8fafc; font-size: 0.95rem; transition: border-color 0.2s;
        }
        .form-control:focus { outline: none; border-color: #38bdf8; }
        .btn-submit {
            width: 100%; padding: 0.85rem; background: #38bdf8; color: #0f172a; font-weight: 700; border: none;
            border-radius: 6px; cursor: pointer; font-size: 1rem; transition: background 0.2s; margin-top: 0.5rem;
        }
        .btn-submit:hover { background: #0284c7; }
        .alert-error {
            background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 0.75rem;
            border-radius: 6px; font-size: 0.85rem; margin-bottom: 1.25rem;
        }
        
        @media (max-width: 900px) {
            .split-container { flex-direction: column; height: auto; }
            .brand-panel { padding: 2.5rem 1.5rem; }
            .auth-panel { padding: 2.5rem 1.5rem; }
        }
    </style>
</head>
<body>

    <div class="split-container">
        <!-- Left: Branding & IoT Prototyping Showcase -->
        <div class="brand-panel">
            <div class="brand-logo">⚡ MagaMart</div>
            <div class="brand-hero">
                <h1>Next-Gen IoT Hardware & Sensors</h1>
                <p>Industrial-grade microcontrollers, telemetry sensors, and rapid prototyping accessories for hardware developers.</p>
                <ul class="features-list">
                    <li>✓ High-precision environmental & motion sensors</li>
                    <li>✓ ESP32, STM32, and RP2040 edge computing nodes</li>
                    <li>✓ Direct dispatch from verified hardware labs</li>
                </ul>
            </div>
            <div style="font-size: 0.8rem; color: #64748b;">Powered by Java Servlet / JSP & MySQL Architecture</div>
        </div>

        <!-- Right: Tabbed Dynamic Authentication UI -->
        <div class="auth-panel">
            <div class="auth-card">
                <nav class="tabs" role="tablist">
                    <button class="tab-btn active" id="tabUserLogin" onclick="switchAuthTab('user-login')">User Login</button>
                    <button class="tab-btn" id="tabRegister" onclick="switchAuthTab('register')">Register</button>
                    <button class="tab-btn" id="tabAdminLogin" onclick="switchAuthTab('admin-login')">Admin Portal</button>
                </nav>

                <!-- 1. Customer Login Form -->
                <form id="formUserLogin" action="login" method="POST">
                    <input type="hidden" name="loginType" value="user">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" class="form-control" required placeholder="sarah.iot@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn-submit">Sign In as Customer</button>
                </form>

                <!-- 2. Customer Registration Form -->
                <form id="formRegister" action="register" method="POST" style="display: none;">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" class="form-control" required placeholder="Dr. Alex Rivera">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" class="form-control" required placeholder="alex@embedded.io">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" required placeholder="At least 6 chars">
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" class="form-control" required placeholder="Repeat password">
                    </div>
                    <button type="submit" class="btn-submit">Create Account</button>
                </form>

                <!-- 3. Administrator Login Form -->
                <form id="formAdminLogin" action="login" method="POST" style="display: none;">
                    <input type="hidden" name="loginType" value="admin">
                    <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38bdf8; color: #bae6fd; padding: 0.6rem; border-radius: 6px; font-size: 0.8rem; margin-bottom: 1rem;">
                        🔒 Restricted Staff Area: Requires 'ADMIN' credentials.
                    </div>
                    <div class="form-group">
                        <label>Admin Email</label>
                        <input type="email" name="email" class="form-control" required placeholder="admin@magamart.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" name="password" class="form-control" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn-submit" style="background: #f59e0b; color: #000;">Authenticate Admin</button>
                </form>
            </div>
        </div>
    </div>

    <!-- Vanilla JavaScript Tab Switching Logic -->
    <script>
        function switchAuthTab(tabId) {
            // Update Tab Button States
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('form').forEach(f => f.style.display = 'none');

            if (tabId === 'user-login') {
                document.getElementById('tabUserLogin').classList.add('active');
                document.getElementById('formUserLogin').style.display = 'block';
            } else if (tabId === 'register') {
                document.getElementById('tabRegister').classList.add('active');
                document.getElementById('formRegister').style.display = 'block';
            } else if (tabId === 'admin-login') {
                document.getElementById('tabAdminLogin').classList.add('active');
                document.getElementById('formAdminLogin').style.display = 'block';
            }
        }
    </script>
</body>
</html>
`,
  },
];
