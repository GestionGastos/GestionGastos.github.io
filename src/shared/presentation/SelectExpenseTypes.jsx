export const SelectExpenseTypes = ({ setRows, shape, expenseTypes = [], t, updateRow, update, index, nameField, module, value, ...props }) => {
    const selectedValue = value ?? '';

    if (module === 'budget-form') {
        return (
            <select {...props} value={selectedValue} onChange={(event) => updateRow(setRows, index, shape.name, event.target.value)}>
                <option value="">Seleccione el tipo de gasto</option>
                { expenseTypes.map((type, index) => (
                    <option key={index} value={type.name}>{t(`budget.${type.name}`)}</option>
                ))}
            </select>
        );
    }

    return (
        <select {...props} value={selectedValue} onChange={(event) => update(index, nameField, event.target.value)}>
            <option value="">Seleccione el tipo de gasto</option>
            { expenseTypes.map((type, index) => (
                <option key={index} value={type.name} >{t(`budget.${type.name}`)}</option>
            ))}
        </select>
    );
}
