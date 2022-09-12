import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {Button, Drawer, List} from "antd";
import "allotment/dist/style.css";
import {CloseOutlined, PlusOutlined} from "@ant-design/icons";
import {context} from '@/stores/context'

const paths = () => {
    let {pathsStore} = useContext(context)
    return (
        <Drawer title='Import Paths' placement='left' width={500} open={pathsStore.pathsDrawerVisible}
                onClose={() => pathsStore.showIncludeDir(false)} style={{padding: 5}}
                bodyStyle={{padding: 5}}
                extra={<Button type='link' icon={<PlusOutlined/>} onClick={() => pathsStore.addIncludeDir()}>Add
                    Path</Button>}>
            <List
                size="large"
                loadMore={<div></div>}
                dataSource={pathsStore.includeDirs}
                renderItem={item =>
                    <List.Item actions={[<a onClick={() => pathsStore.removeIncludeDir(item)}><CloseOutlined/></a>]}>
                        {item}
                    </List.Item>}
            />
        </Drawer>);
}

export default observer(paths)