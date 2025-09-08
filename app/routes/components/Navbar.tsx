import React from "react";
import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link className="navbar-brand" to="/">
                <p className="text-2xl font-bold text-gradient">Resumind</p>
            </Link>
            <Link className="navbar-brand" to="/upload">
                <p className="primary-button w-fit">Upload</p>
            </Link>
        </nav>
    )
}

export default Navbar;

