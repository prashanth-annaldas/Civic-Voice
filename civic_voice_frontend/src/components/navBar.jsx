import { Link, NavLink } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

function NavBar() {
  return (
    <div className="container-fluid px-3">
      <header className="navbar shadow-sm bg-white">
        <div className="row w-100 align-items-center">
          <div className="col-md-3"></div>

          <div className="col-md-6 d-flex justify-content-center">
            <ul className="nav nav-pills">
              {[
                { name: "Home", path: "/" },
                { name: "Problems", path: "/problems" },
                { name: "Requests", path: "/requests" },
                { name: "Contact", path: "/contact" },
                { name: "About", path: "/about" },
              ].map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      "nav-link" + (isActive ? " active" : "")
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-3 d-flex justify-content-end gap-2">
            <button className="btn btn-outline-primary"><Link to="/login">Login</Link></button>
            <button className="btn btn-outline-primary"><Link to="/register">Sign Up</Link></button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default NavBar;
