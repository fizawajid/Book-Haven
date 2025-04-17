
import "../main.css";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { AiOutlinePlus, AiOutlineUser } from "react-icons/ai";

const Header = ({ toggleTheme, isDarkMode, openModal }) => {  
  return (
    <header className="header">
      <h1 className="header-title">MyBookshelf</h1>
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

