import api from '../utils/api'

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserInterface } from '../components/interfaces/UserInterface'

export default function useAuth() {

    async function register(user: UserInterface) {

        try {
            const data = await api.post('/users/register', user).then((response) => {
                return response.data
            })

            console.log(data)
        } catch (error) {
            console.log(error)
        }

    }
    
    return { register }
}