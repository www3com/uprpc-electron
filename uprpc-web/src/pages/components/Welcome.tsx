import {PlusOutlined, SmileOutlined} from "@ant-design/icons";
import {Button, Result, Tabs} from "antd";
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {context} from "@/stores/context";

const welcome = () => {
    let {protoStore} = useContext(context)
    const items = [{
        label: 'Home Page',
        key: 'home',
        children:
            <div style={{height: '100%', display: "flex", justifyContent: 'center', alignItems: 'center'}}>
                <Result
                    icon={<SmileOutlined style={{fontSize: 120}}/>}
                    title="Welcome to use upRpc"
                    subTitle='Swim in the ocean of knowledge and enjoy it.'
                    extra={<Button type="primary"
                                   onClick={() => protoStore.importProto()}
                                   icon={<PlusOutlined/>}>Import Protos</Button>}/>
            </div>
    }];
    return (<Tabs style={{height: '100%'}} items={items}/>)
}

export default observer(welcome);