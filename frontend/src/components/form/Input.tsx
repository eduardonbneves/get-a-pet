import styles from './Input.module.css'

interface InputProps {
  type: string;
  text: string;
  name: string;
  placeholder?: string;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  multiple?: boolean;
}

function Input({type, text, name, placeholder, handleOnChange, value, multiple}: InputProps) {
    return(
        <div className={styles.form_control}>
            <label htmlFor={name}>{text}:</label>
            <input 
                type={type} 
                name={name} 
                id={name} 
                placeholder={placeholder} 
                onChange={handleOnChange}
                value={value}
                {...(multiple ? {multiple} : '')}    
            />
        </div>
    )
}

export default Input