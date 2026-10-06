const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const SelectMonth = ({ setValue, value, ...props }) => {
    return (
        <select {...props} value={value} onChange={(event) => setValue((current) => ({ ...current, month: event.target.value }))}>
            {monthNames.map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>
    );
}
