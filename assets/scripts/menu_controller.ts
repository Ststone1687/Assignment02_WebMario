const {ccclass}=cc._decorator;

@ccclass
export default class menu_controller extends cc.Component{
    onLoad(){
        cc.debug.setDisplayStats(false);
        this.clear_canvas();
        this.make_bg();
        this.make_label("WEB MARIO",60,cc.v2(0,160));
        this.make_label("Assignment 02",28,cc.v2(0,95));
        this.make_button("START GAME",cc.v2(0,-20),()=>{
            cc.director.loadScene("LevelSelect");
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
        g.fillColor=cc.color(80,170,255);
        g.rect(-480,-320,960,640);
        g.fill();

        const ground=new cc.Node("ground");
        ground.parent=this.node;
        ground.setContentSize(960,120);
        ground.setPosition(0,-260);
        const gg=ground.addComponent(cc.Graphics);
        gg.fillColor=cc.color(80,180,80);
        gg.rect(-480,-60,960,120);
        gg.fill();
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
        node.setContentSize(260,70);
        node.setPosition(pos);

        const g=node.addComponent(cc.Graphics);
        g.fillColor=cc.color(255,170,60);
        g.roundRect(-130,-35,260,70,12);
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
