//Modal.js
import React, { useRef, useState } from "react";
import ReactDom from "react-dom";

export const Modal = ({ setShowModal }) => {
    const [state, setState] = useState({
        title: "",
        description: "",
        targetFundingPrice:""
    })

    const handleChange = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value,
        })
    }
    // close the modal when clicking outside the modal.
    const modalRef = useRef();
    const closeModal = (e) => {
        if (e.target === modalRef.current) {
            setShowModal(false);
        }
    };


    //render the modal JSX in the portal div.
    return ReactDom.createPortal(
        <div className="container" ref={modalRef} onClick={closeModal}>
            <div className="modal">
                <form id="form">
                    <label>
                        Title:
                        <input
                            type="text"
                            name="fname"
                            value={state.title}
                            onChange={handleChange}
                        />
                    </label>
                    <p></p>
                    <label>
                       Description:
                        <textarea
                            type="text"
                            name="lname"
                            value={state.description}
                            onChange={handleChange}
                        />
                    </label>
                    <p></p>
                    <label>
                        Target Funding:
                        <input
                            type="text"
                            name="fname"
                            value={state.targetFundingPrice}
                            onChange={handleChange}
                        />
                    </label>
                </form>        <button onClick={() => setShowModal(false)}>X</button>
            </div>
        </div>,
        document.getElementById("portal")
    );
};