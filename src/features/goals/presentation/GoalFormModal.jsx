import { X } from "lucide-react";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { Button } from "../../../shared/presentation/Button";
import { Modal } from "../../../shared/presentation/Modal";
import { useMemo, useState } from "react";
import { GoalCard } from "./GoalCard";
import { SelectMonth } from "../../../shared/presentation/SelectMonth";

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const GoalFormModal = ({ onClose, onSubmit }) => {
    const currentDate = getCurrentDate();
    const { t } = useI18n();
    const [step, setStep] = useState(0);
    const [message, setMessage] = useState("");
    const [ goal, setGoal ] = useState({ name: "", type: "", subtype: "", value: "", current: 0, objective_date: "", month: "", status: "pending", created_at: currentDate });
    const [ goalError, setGoalError ] = useState({ name: "", type: "", subtype: "", value: "" })

    const steps = useMemo(() => ['Tipo Meta', 'Valores', 'Confirmar']);

    const goalType = useMemo(() => [
        { name: 'ahorro', value: 'saving', description: 'goal.saving.description' },
        { name: 'viaje', value: 'travel', description: 'goal.travel.description' },
        { name: 'presupuesto', value: 'budget', description: 'goal.budget.description' },
        { name: 'Fondo Emergencia', value: 'emergency', description: 'goal.emergency.description' },
        { name: 'inversion', value: 'investment', description: 'goal.investment.description' }
    ]);

    const goalSubType = useMemo(() => [
        { name: "renta", value: 'rent' },
        { name: "servicios", value: 'utilities' },
        { name: "internet", value: "internet" },
        { name: "mercado", value: "groceries" },
        { name: "transporte", value: "transportation" },
        { name: "educacion", value: "education" }
    ]);

    const selectType = (e) => {
        setGoal({ ...goal, type: e.target.value });
        setMessage(t(`goal.${e.target.value}.description`));
    }

    const selectSubtype = (e) => {
        setGoal({ ...goal,subtype: e.target.value });
    }

    const completeStep = (index) => {
        if (step === 0 || index === 1) {
           if (goal.type === '') {
                setGoalError({ ...goalError, type: "Debe seleccionar un tipo" });
                return;
           }

           if (goal.type === 'budget') {
                if (goal.subtype === '') {
                    setGoalError({ ...goalError, subtype: "Debe seleccionar un subtipo" });
                }
           }
        }

        if (step === 1 || index === 2) {
            let valid = true;
            if (goal.name === '') {
                setGoalError({ ...goalError, name: "Debe ingresar un nombre"});
                valid = false;
            }

            if (goal.value === '') {
                setGoalError({ ...goalError, value: "Debe asignar un valor"});
                valid = false;
            }

            if (!valid) {
                return;
            }
        }

        index ? setStep(index) : setStep((current) => current + 1);
    }

    const save = async () => {
        await onSubmit(goal);
    }

    return (
        <Modal>
            <div className="modal-heading">
                <div>
                    <p className="eyebrow">Crear Meta</p>
                    <h2>{steps[step]}</h2>
                </div>
                <Button type="button" variant="ghost" onClick={onClose} aria-label={t('budget.cancel')}>
                    <X size={18} />
                </Button>
            </div>
            <div className="stepper">
                {steps.map((label, index) => (
                    <button className={index === step ? 'active' : ''} key={label} type="button" onClick={() =>completeStep(index)}>
                        {label}
                    </button>
                ))}
            </div>
            <div>
                <div className="form-stack">
                    {step === 0 &&
                        <>
                            <h4>{message}</h4>
                            <label>
                                Tipo Meta
                                <select onChange={(e) => selectType(e) }>
                                    <option value="">Tipo Meta</option>
                                    {goalType.map((type, index) => (
                                        <option key={index} value={type.value}>{type.name}</option>
                                    ))}
                                </select>
                                <small>{ goalError.type }</small>
                            </label>
                            { goal.type === 'budget' &&
                                <label>
                                    Subtipo Meta
                                    <select onChange={(e) => selectSubtype(e) }>
                                        <option value="">Suptipo</option>
                                        { goalSubType.map((type, index) => (
                                            <option key={index} value={type.value}>{type.name}</option>
                                        ))}
                                    </select>
                                </label>
                            }       
                        </>
                    }
                    { step === 1 && <SecondForm goal={goal} setGoal={setGoal} goalError={goalError} /> }
                    { step === 2 && <GoalCard name={goal.name} target={goal.value} date={goal.objective_date} /> }
                </div>
                <div className="modal-actions">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t('budget.cancel')}
                    </Button>
                    { step < 2 ? (
                         <Button type="button" onClick={() => completeStep() }>
                            {steps[step + 1]}
                        </Button>
                    ) : (
                        <Button type="button" onClick={save}>
                            Guardar
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    )
}

const SecondForm = ({ goal, setGoal, goalError }) => {
    return (
        <>
            <div className="two-column">
                <label>
                    Nombre
                    <input type="text" value={goal.name} onChange={(e) => setGoal({ ...goal, name: e.target.value })}/>
                    <small>{ goalError.name }</small>
                </label>
                
                <label>
                    Valor
                    <input type="number" value={goal.value} onChange={(e) => setGoal({ ...goal, value: e.target.value })}/>
                    <small>{ goalError.value }</small>
                </label>
            </div>
            <label>
                Fecha Objectivo
                <input type="date" value={goal.objective_date} onChange={(e) => setGoal({ ...goal, objective_date: e.target.value })} />
            </label>
            <label>
                Mes
                <SelectMonth setValue={setGoal} value={goal.month} />
            </label>
        </>
    );
}

const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    let month = currentDate.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`;
    }
    let day = currentDate.getDay();
    if (day < 10) {
        day = `0${day}`;
    }

    return `${year}-${month}-${day}`;
}