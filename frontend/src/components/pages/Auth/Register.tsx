import { useState, useContext } from 'react'

import Input from '../../form/Input'
import { Link } from 'react-router-dom'

import styles from '../../form/Form.module.css'

import { Context } from '../../../context/UserContext'
import { UserInterface } from '../../interfaces/UserInterface'

function Register() {

    const [user, setUser] = useState<UserInterface>({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const { register } = useContext(Context)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        console.log(user)
        register(user)
    }

    return (
        <section className={styles.form_container}>
            <h1>Registrar</h1>
            <form onSubmit={handleSubmit}>
                <Input
                    text='Nome'
                    type='text'
                    name='name'
                    placeholder='Digite o seu nome'
                    handleOnChange={handleChange}
                />
                <Input
                    text='Telefone'
                    type='text'
                    name='phone'
                    placeholder='Digite o seu telefone'
                    handleOnChange={handleChange}
                />
                <Input
                    text='E-mail'
                    type='text'
                    name='email'
                    placeholder='Digite o seu email'
                    handleOnChange={handleChange}
                />
                <Input
                    text='Senha'
                    type='password'
                    name='password'
                    placeholder='Digite a sua senha'
                    handleOnChange={handleChange}
                />
                <Input
                    text='ConfirSenha'
                    type='password'
                    name='confirmPassword'
                    placeholder='Confirme a sua senha'
                    handleOnChange={handleChange}
                />
                <input type='submit' value='Cadastrar' />
            </form>
            <p>
                Já tem conta? <Link to='/login'>Clique aqui.</Link>
            </p>
        </section>
    )
}

export default Register