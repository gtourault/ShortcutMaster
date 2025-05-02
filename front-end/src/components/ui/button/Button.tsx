import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', variant = 'primary' }) => {
    return (
        <button onClick={onClick} type={type} className={`${styles.button} ${styles[variant]}`}>
            {children}
        </button>
    );
};

export default Button;
