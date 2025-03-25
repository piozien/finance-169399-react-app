package graduate.finance_dashboard.controller;

import graduate.finance_dashboard.dto.CategoryDto;
import graduate.finance_dashboard.dto.CategoryMapper;
import graduate.finance_dashboard.model.Category;
import graduate.finance_dashboard.model.User;
import graduate.finance_dashboard.service.CategoryService;
import graduate.finance_dashboard.service.UserService;
import graduate.finance_dashboard.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;
    private final CategoryMapper categoryMapper;
    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    private User getUserByEmailOrThrow(String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new ApiException("User with email " + email + " not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto categoryDto, @RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        Category category = categoryMapper.toEntity(categoryDto, user);
        Category createdCategory = categoryService.createCategory(category, user);
        return ResponseEntity.ok(categoryMapper.toDto(createdCategory));
    }

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getUserCategories(@RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        List<Category> categories = categoryService.getCategoriesByUser(user);
        return ResponseEntity.ok(categories.stream().map(categoryMapper::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategory(@PathVariable Long id, @RequestHeader("Email") String email) {
        getUserByEmailOrThrow(email);
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(categoryMapper.toDto(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDto categoryDto,
            @RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        Category category = categoryMapper.toEntity(categoryDto, user);
        Category updatedCategory = categoryService.updateCategory(id, category, user);
        return ResponseEntity.ok(categoryMapper.toDto(updatedCategory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, @RequestHeader("Email") String email) {
        log.info("Received request to delete category: id={}, email={}", id, email);
        User user = getUserByEmailOrThrow(email);
        log.info("Found user: id={}", user.getUser_id());
        categoryService.deleteCategory(id, user);
        log.info("Category successfully deleted: id={}", id);
        return ResponseEntity.noContent().build();
    }
}
