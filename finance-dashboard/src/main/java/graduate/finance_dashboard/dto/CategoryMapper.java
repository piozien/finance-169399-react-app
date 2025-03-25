package graduate.finance_dashboard.dto;

import graduate.finance_dashboard.model.Category;
import graduate.finance_dashboard.model.User;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }

    public Category toEntity(CategoryDto dto, User user) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setUser(user);
        return category;
    }
}
