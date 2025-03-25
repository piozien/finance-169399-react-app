package graduate.finance_dashboard.dto;

import graduate.finance_dashboard.model.Expense;
import lombok.experimental.UtilityClass;
import java.time.LocalDateTime;

@UtilityClass
public class ExpenseMapper {

    public ExpenseDto toDto(Expense expense) {
        if (expense == null) return null;

        ExpenseDto dto = new ExpenseDto();
        dto.setId(expense.getId());
        dto.setAmount(expense.getAmount());
        dto.setDescription(expense.getDescription());
        dto.setCategoryId(expense.getCategory() != null ? expense.getCategory().getId() : null);
        dto.setDate(expense.getCreatedAt());
        return dto;
    }

    public Expense toEntity(ExpenseDto dto) {
        if (dto == null) return null;

        Expense expense = new Expense();
        expense.setId(dto.getId());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        expense.setCreatedAt(dto.getDate() != null ? dto.getDate() : LocalDateTime.now());
        return expense;
    }
}
