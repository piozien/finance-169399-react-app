package graduate.finance_dashboard.service;

import graduate.finance_dashboard.exception.ApiException;
import graduate.finance_dashboard.model.Category;
import graduate.finance_dashboard.model.Expense;
import graduate.finance_dashboard.model.User;
import graduate.finance_dashboard.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Transactional
    public Expense createExpense(Expense expense, User user) {
        if (expense.getAmount() == null || expense.getAmount().signum() <= 0) {
            throw new ApiException("The amount must be greater than zero", HttpStatus.BAD_REQUEST);
        }

        expense.setUser(user);
        log.info("Creating expense for user: {} in category: {}", user.getUser_id(),
                expense.getCategory() != null ? expense.getCategory().getName() : "No category");

        return expenseRepository.save(expense);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByUser(User user) {
        log.info("Fetching expenses for user: {}", user.getUser_id());
        return expenseRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByUserAndCategory(User user, Category category) {
        log.info("Fetching expenses for user: {} in category: {}", user.getUser_id(), category.getName());
        return expenseRepository.findByUserAndCategory(user, category);
    }

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByUserAndDateRange(User user, LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new ApiException("Start and end dates are required", HttpStatus.BAD_REQUEST);
        }
        if (start.isAfter(end)) {
            throw new ApiException("Start date must be earlier than the end date", HttpStatus.BAD_REQUEST);
        }

        log.info("Fetching expenses for user: {} within the range {} - {}", user.getUser_id(), start, end);
        return expenseRepository.findByUserAndCreatedAtBetween(user, start, end);
    }

    @Transactional(readOnly = true)
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Expense with ID: {} not found", id);
                    return new ApiException("Expense with ID: " + id + " not found", HttpStatus.NOT_FOUND);
                });
    }

    @Transactional
    public Expense updateExpense(Long id, Expense expenseDetails, User user) {
        Expense expense = getExpenseById(id);

        if (!expense.getUser().getUser_id().equals(user.getUser_id())) {
            log.error("User {} does not have permission to edit expense {}", user.getUser_id(), id);
            throw new ApiException("You do not have permission to edit this expense", HttpStatus.FORBIDDEN);
        }

        if (expenseDetails.getAmount() != null) {
            if (expenseDetails.getAmount().signum() <= 0) {
                throw new ApiException("The amount must be greater than zero", HttpStatus.BAD_REQUEST);
            }
            expense.setAmount(expenseDetails.getAmount());
        }

        if (expenseDetails.getDescription() != null) {
            expense.setDescription(expenseDetails.getDescription());
        }

        if (expenseDetails.getCategory() != null) {
            log.info("Changing category of expense {} from {} to {}", id,
                    expense.getCategory() != null ? expense.getCategory().getName() : "None",
                    expenseDetails.getCategory().getName());
            expense.setCategory(expenseDetails.getCategory());
        }

        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long id, User user) {
        Expense expense = getExpenseById(id);

        if (!expense.getUser().getUser_id().equals(user.getUser_id())) {
            log.error("User {} does not have permission to delete expense with ID: {}", user.getUser_id(), id);
            throw new ApiException("You do not have permission to delete this expense", HttpStatus.FORBIDDEN);
        }

        log.info("Deleting expense with ID: {}", id);
        expenseRepository.deleteById(id);
    }
}
