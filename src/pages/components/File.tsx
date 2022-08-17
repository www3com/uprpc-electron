import React from "react";
import {inject, observer} from "mobx-react";
import {Button} from "antd";

const file = ({store}: any) => {
    const onClick = () => {
        store.add()
    }

    return (<div style={{backgroundColor: 'black'}}>
        <Button onClick={onClick}>Add</Button>
    </div>)
}

export default inject('store')(observer(file))