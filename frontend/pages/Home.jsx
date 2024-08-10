import { Link, NavLink } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  return (
    <div className="container mt-5 d-flex">
      <div className="left">
        <h1>Track your Coins with CryptoSense Portfolio</h1>
        <p>
          Whether you’re just observing the crypto market or meticulously
          tracking your holdings <br />
          CryptoSense Portfolio is tailored to meet your needs.
        </p>
        <button data-bs-toggle="modal" data-bs-target="#exampleModal">
          Create Portfolio it's Free!
        </button>
        <div
          class="modal fade"
          id="exampleModal"
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">
                  Modal title
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">Login or Create an account</div>
              <div class="modal-footer">
                <Link to="/login" >
                <button
                  type="button"
                  class="btn btn-success"
                >
                  Login
                </button>
                </Link>
                <Link to="/register" >
                <button type="button" class="btn btn-primary">
                  Register
                </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right">
        <img
          className=""
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2x3OHZyajNkZ2Z5ZWxveDNqYmJxdnM3amI1MDk4cHg2ZXdreHU2eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ww9Z3l8wl4szKyRIro/giphy.webp"
          alt=""
        />
      </div>
    </div>
  );
};
