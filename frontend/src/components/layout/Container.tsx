import { ContainerProps } from '../interfaces/ContainerPropsInterface'

import styles from './Container.module.css'

function Container({children}: ContainerProps) {
    return(
       <main className={styles.container}>{children}</main>
    )
}

export default Container