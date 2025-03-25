package graduate.finance_dashboard.controller;

import graduate.finance_dashboard.dto.ExpenseDto;
import graduate.finance_dashboard.dto.ExpenseMapper;
import graduate.finance_dashboard.exception.ApiException;
import graduate.finance_dashboard.model.Category;
import graduate.finance_dashboard.model.Expense;
import graduate.finance_dashboard.model.User;
import graduate.finance_dashboard.service.CategoryService;
import graduate.finance_dashboard.service.ExpenseService;
import graduate.finance_dashboard.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Slf4j
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;
    private final CategoryService categoryService;

    private User getUserByEmailOrThrow(String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new ApiException("User not found with email " + email, HttpStatus.NOT_FOUND);
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@RequestBody ExpenseDto expenseDto, @RequestHeader("Email") String email) {
        log.info("Creating expense: amount={}, category={}, description={}", 
            expenseDto.getAmount(), expenseDto.getCategoryId(), expenseDto.getDescription());
        
        if (expenseDto.getAmount() == null || expenseDto.getAmount().signum() <= 0) {
            throw new ApiException("Amount must be greater than zero", HttpStatus.BAD_REQUEST);
        }
        if (expenseDto.getCategoryId() == null) {
            throw new ApiException("Category is required", HttpStatus.BAD_REQUEST);
        }

        User user = getUserByEmailOrThrow(email);
        Category category = categoryService.getCategoryById(expenseDto.getCategoryId());
        
        if (!category.getUser().getUser_id().equals(user.getUser_id())) {
            throw new ApiException("You don't have access to this category", HttpStatus.FORBIDDEN);
        }

        try {
            Expense expense = ExpenseMapper.toEntity(expenseDto);
            expense.setCategory(category);
            expense.setUser(user);
            Expense createdExpense = expenseService.createExpense(expense, user);
            log.info("Successfully created expense with ID: {}", createdExpense.getId());
            return ResponseEntity.ok(ExpenseMapper.toDto(createdExpense));
        } catch (Exception e) {
            log.error("Error creating expense: {}", e.getMessage());
            throw new ApiException("Failed to create expense", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getUserExpenses(@RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        List<Expense> expenses = expenseService.getExpensesByUser(user);
        return ResponseEntity.ok(expenses.stream().map(ExpenseMapper::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDto> getExpense(@PathVariable Long id, @RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        Expense expense = expenseService.getExpenseById(id);

        if (!expense.getUser().getUser_id().equals(user.getUser_id())) {
            throw new ApiException("You don't have access to this expense", HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(ExpenseMapper.toDto(expense));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ExpenseDto>> getExpensesByCategory(
            @PathVariable Long categoryId, @RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        Category category = categoryService.getCategoryById(categoryId);
        
        if (!category.getUser().getUser_id().equals(user.getUser_id())) {
            throw new ApiException("You don't have access to this category", HttpStatus.FORBIDDEN);
        }

        List<Expense> expenses = expenseService.getExpensesByUserAndCategory(user, category);
        return ResponseEntity.ok(expenses.stream().map(ExpenseMapper::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseDto>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestHeader("Email") String email) {
        User user = getUserByEmailOrThrow(email);
        List<Expense> expenses = expenseService.getExpensesByUserAndDateRange(user, start, end);
        return ResponseEntity.ok(expenses.stream().map(ExpenseMapper::toDto).collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable Long id, @RequestBody ExpenseDto expenseDto, @RequestHeader("Email") String email) {
        log.info("Updating expense: id={}, amount={}, category={}, description={}", 
            id, expenseDto.getAmount(), expenseDto.getCategoryId(), expenseDto.getDescription());

        User user = getUserByEmailOrThrow(email);
        Expense existingExpense = expenseService.getExpenseById(id);

        if (!existingExpense.getUser().getUser_id().equals(user.getUser_id())) {
            throw new ApiException("You don't have access to this expense", HttpStatus.FORBIDDEN);
        }

        if (expenseDto.getCategoryId() != null) {
            Category category = categoryService.getCategoryById(expenseDto.getCategoryId());
            if (!category.getUser().getUser_id().equals(user.getUser_id())) {
                throw new ApiException("You don't have access to this category", HttpStatus.FORBIDDEN);
            }
            existingExpense.setCategory(category);
        }

        if (expenseDto.getAmount() != null) {
            if (expenseDto.getAmount().signum() <= 0) {
                throw new ApiException("Amount must be greater than zero", HttpStatus.BAD_REQUEST);
            }
            existingExpense.setAmount(expenseDto.getAmount());
        }

        if (expenseDto.getDescription() != null) {
            existingExpense.setDescription(expenseDto.getDescription());
        }

        Expense updatedExpense = expenseService.updateExpense(id, existingExpense, user);
        log.info("Successfully updated expense with ID: {}", id);
        return ResponseEntity.ok(ExpenseMapper.toDto(updatedExpense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id, @RequestHeader("Email") String email) {
        log.info("Deleting expense: id={}", id);
        
        User user = getUserByEmailOrThrow(email);
        Expense expense = expenseService.getExpenseById(id);

        if (!expense.getUser().getUser_id().equals(user.getUser_id())) {
            throw new ApiException("You don't have access to this expense", HttpStatus.FORBIDDEN);
        }

        expenseService.deleteExpense(id, user);
        log.info("Successfully deleted expense with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
