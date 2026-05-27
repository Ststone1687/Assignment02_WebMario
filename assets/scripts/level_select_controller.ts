const {ccclass}=cc._decorator;

@ccclass
export default class level_select_controller extends cc.Component{
    onLoad(){
        cc.debug.setDisplayStats(false);
        this.clear_canvas();
        this.make_bg();
        this.make_label("SELECT LEVEL",50,cc.v2(0,165));
        this.make_button("LEVEL 1",cc.v2(0,60),()=>{
            cc.sys.localStorage.setItem("selected_level","1");
            cc.director.loadScene("GameLevel1");
        });
        this.make_button("LEVEL 2",cc.v2(0,-30),()=>{
            cc.sys.localStorage.setItem("selected_level","2");
            cc.director.loadScene("GameLevel2");
        });
        this.make_button("BACK",cc.v2(0,-120),()=>{
            cc.director.loadScene("Menu");
        });
    }

    clear_canvas(){
        for(let i=this.node.childrenCount-1;i>=0;i--){
            const child=this.node.children[i];
            if(child.name!="Main Camera"){
                child.destroy();
            }
        }
    }

    make_bg(){
        const bg=new cc.Node("bg");
        bg.parent=this.node;
        bg.setContentSize(960,640);
        bg.setPosition(0,0);
        const g=bg.addComponent(cc.Graphics);
        g.fillColor=cc.color(70,120,220);
        g.rect(-480,-320,960,640);
        g.fill();
    }

    make_label(text:string,size:number,pos:cc.Vec2){
        const node=new cc.Node(text);
        node.parent=this.node;
        node.setPosition(pos);
        const label=node.addComponent(cc.Label);
        label.string=text;
        label.fontSize=size;
        label.lineHeight=size+8;
        label.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign=cc.Label.VerticalAlign.CENTER;
        return label;
    }

    make_button(text:string,pos:cc.Vec2,callback:()=>void){
        const node=new cc.Node(text);
        node.parent=this.node;
        node.setContentSize(240,65);
        node.setPosition(pos);

        const g=node.addComponent(cc.Graphics);
        g.fillColor=cc.color(255,180,70);
        g.roundRect(-120,-32,240,65,12);
        g.fill();

        const button=node.addComponent(cc.Button);
        button.transition=cc.Button.Transition.NONE;
        node.on(cc.Node.EventType.TOUCH_END,callback,this);

        const label_node=new cc.Node("label");
        label_node.parent=node;
        label_node.setPosition(0,0);
        const label=label_node.addComponent(cc.Label);
        label.string=text;
        label.fontSize=28;
        label.lineHeight=34;
        label.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign=cc.Label.VerticalAlign.CENTER;
    }
}
