export const Modal = ({ children, ariaLabel }) => {
    return (
       <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={ariaLabel}>
            <section className="modal-sheet">
                { children }
            </section>
        </div>
    );
}
