import {SmileOutlined} from "@ant-design/icons";
import {Button, Result, Tabs} from "antd";

export default () => {
    return (<Tabs style={{height: '100%'}}>
        <Tabs.TabPane tab='home Page' key='home' style={{height: "100%"}}>
            <div style={{height: '100%', display: "flex", justifyContent: 'center', alignItems: 'center'}}>
                <Result
                    icon={<SmileOutlined/>}
                    title="Welcome to use upRpc!"
                    extra={<Button type="primary">Import Protos</Button>}
                />
            </div>
        </Tabs.TabPane>
    </Tabs>)
}
