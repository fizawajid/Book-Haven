import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineUser } from "react-icons/ai";
import { IoLibraryOutline } from "react-icons/io5";
import "../main.css";

const Header = ({ toggleTheme, isDarkMode, openModal }) => {
  return (
    <header className="header">
      <h1 className="header-title"><IoLibraryOutline  style={{ marginBottom: '-2px'}}/> BookHaven</h1>
      <div className="header-buttons">
        {/* Add Book Button */}
        <button onClick={openModal}>
          <AiOutlinePlus />
        </button>

        {/* Dark Mode Toggle */}
        <button onClick={toggleTheme}>
          {isDarkMode ? <BsFillSunFill /> : <BsFillMoonFill />}
        </button>

        {/* User Account Button */}
        <button>
          <AiOutlineUser />
        </button>
      </div>
    </header>
  );
};

export default Header;
