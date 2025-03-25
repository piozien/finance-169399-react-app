package graduate.finance_dashboard.service;

import graduate.finance_dashboard.exception.ApiException;
import graduate.finance_dashboard.model.Category;
import graduate.finance_dashboard.model.User;
import graduate.finance_dashboard.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Category> getCategoriesByUser(User user) {
        log.info("Retrieving categories for user: {}", user.getUser_id());
        return categoryRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", id);
                    return new ApiException("Category not found with ID: " + id, HttpStatus.NOT_FOUND);
                });
    }

    @Transactional
    public Category createCategory(Category category, User user) {
        log.info("Creating new category for user: {}", user.getUser_id());

        if (categoryRepository.existsByNameAndUser(category.getName(), user)) {
            log.error("Attempt to create duplicate category: {} for user: {}", 
                category.getName(), user.getUser_id());
            throw new ApiException("Category with name '" + category.getName() + "' already exists", 
                HttpStatus.CONFLICT);
        }

        category.setUser(user);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category categoryDetails, User user) {
        Category category = getCategoryById(id);

        if (!category.getUser().getUser_id().equals(user.getUser_id())) {
            log.error("User {} does not have permission to edit category {}", user.getUser_id(), id);
            throw new ApiException("You don't have permission to edit this category", HttpStatus.FORBIDDEN);
        }

        Optional<Category> existingCategory = categoryRepository.findByNameAndUser(categoryDetails.getName(), user);
        if (existingCategory.isPresent() && !existingCategory.get().getId().equals(id)) {
            log.error("Attempt to change category name to existing one: {} for user: {}", 
                categoryDetails.getName(), user.getUser_id());
            throw new ApiException("Category with name '" + categoryDetails.getName() + "' already exists", 
                HttpStatus.CONFLICT);
        }

        category.setName(categoryDetails.getName());
        log.info("Updated category name with ID: {}", id);
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long categoryId, User user) {
        log.info("Starting category deletion: id={}, userId={}", categoryId, user.getUser_id());
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.error("Category not found: id={}", categoryId);
                    return new ApiException("Category not found", HttpStatus.NOT_FOUND);
                });

        if (!category.getUser().getUser_id().equals(user.getUser_id())) {
            log.error("Unauthorized attempt to delete category: categoryId={}, requestUserId={}, ownerUserId={}", 
                categoryId, user.getUser_id(), category.getUser().getUser_id());
            throw new ApiException("You don't have permission to delete this category", HttpStatus.FORBIDDEN);
        }

        try {
            log.info("Deleting category and related expenses: {}", categoryId);
            categoryRepository.delete(category);
            log.info("Successfully deleted category: {}", categoryId);
        } catch (Exception e) {
            log.error("Error while deleting category {}: {}", categoryId, e.getMessage());
            throw new ApiException("Failed to delete category", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
