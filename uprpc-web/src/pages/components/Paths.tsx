import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Button, Drawer, List, Space, Table} from "antd";
import "allotment/dist/style.css";
import {CloseCircleOutlined, CloseOutlined, PlusOutlined} from "@ant-design/icons";
import {context} from '@/stores/store'


const paths = () => {
    let {store} = useContext(context)


    return (
        <Drawer title='Import Paths' placement='left' width={500} visible={store.pathsDrawerVisible}
                onClose={() => store.showPaths(false)} style={{padding: 5}}
                bodyStyle={{padding: 5}}
                extra={<Button type='link' icon={<PlusOutlined/>} onClick={() => store.addPath()}>Add Path</Button>}>
            <List
                size="large"
                loadMore={<div></div>}
                dataSource={store.paths}
                renderItem={item =>
                    <List.Item actions={[<a onClick={() => store.removePath(item)}><CloseOutlined/></a>]}>
                        {item}
                    </List.Item>}
            />
        </Drawer>);
}

export default observer(paths)