import React, { ReactNode } from "react";

import styles from './Container.module.css'

interface Props {
    children?: ReactNode
}

function Container({children}: Props) {
    return(
       <main className={styles.container}>{children}</main>
    )
}

export default Container