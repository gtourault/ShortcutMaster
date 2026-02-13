import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = 'button', variant = 'primary', ...props }) => {
    return (
        <button 
        {...props}
        onClick={onClick} 
        type={type} 
        className={`${styles.button} ${styles[variant]} ${props.className ?? ''}`}>
            {children}
        </button>
    );
};

export default Button;
