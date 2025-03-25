package graduate.finance_dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDto {
    private Long id;
    private BigDecimal amount;
    private String description;
    private Long categoryId;
    private LocalDateTime date = LocalDateTime.now();
}
