const {ccclass}=cc._decorator;

@ccclass
export default class main_game extends cc.Component{
    life:number=3;
    score:number=0;
    time_left:number=120;
    time_count:number=0;
    game_finished:boolean=false;
    invincible_time:number=0;
    key_left:boolean=false;
    key_right:boolean=false;
    want_jump:boolean=false;
    enemy_dir:number=-1;
    question_used:boolean=false;
    spawn_pos:cc.Vec2=cc.v2(-390,-170);

    camera:cc.Node=null;
    ui:cc.Node=null;
    player:cc.Node=null;
    player_body:cc.RigidBody=null;
    enemy:cc.Node=null;
    enemy_body:cc.RigidBody=null;
    question_block:cc.Node=null;
    flag:cc.Node=null;
    mushroom:cc.Node=null;
    mushroom_body:cc.RigidBody=null;
    mushroom_vy:number=0;
    mushroom_dir:number=1;
    coins:cc.Node[]=[];
    surfaces:{x1:number,x2:number,y:number}[]=[];

    life_label:cc.Label=null;
    score_label:cc.Label=null;
    timer_label:cc.Label=null;
    result_label:cc.Label=null;

    audio:{[key:string]:cc.AudioClip}={};
    anim_time:number=0;
    walk_id:number=0;
    goomba_id:number=0;
    mario_frames:cc.SpriteFrame[]=[];
    mario_big_frames:cc.SpriteFrame[]=[];
    goomba_frames:cc.SpriteFrame[]=[];
    player_sprite:cc.Sprite=null;
    goomba_sprite:cc.Sprite=null;
    is_big:boolean=false;
    pending_level_reset:boolean=false;
    level_id:number=1;

    onLoad(){
        cc.debug.setDisplayStats(false);
        this.level_id=this.get_selected_level();
        cc.director.getPhysicsManager().enabled=true;
        cc.director.getPhysicsManager().gravity=cc.v2(0,-1100);

        this.clear_canvas();
        this.life=3;
        this.score=0;
        this.time_left=this.get_start_time();
        this.time_count=0;
        this.game_finished=false;
        this.invincible_time=0;
        this.key_left=false;
        this.key_right=false;
        this.want_jump=false;
        this.enemy_dir=-1;
        this.question_used=false;
        this.is_big=false;
        this.coins=[];
        this.surfaces=[];

        this.camera=cc.find("Main Camera",this.node);
        this.build_world();
        this.build_ui();
        this.load_audio();
        this.load_sprites();
        this.update_ui();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.on_key_down,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.on_key_up,this);
    }

    onDestroy(){
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN,this.on_key_down,this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP,this.on_key_up,this);
        cc.audioEngine.stopMusic();
    }

    clear_canvas(){
        for(let i=this.node.childrenCount-1;i>=0;i--){
            const child=this.node.children[i];
            if(child.name!="Main Camera"){
                child.destroy();
            }
        }
    }

    clear_world(){
        for(let i=this.node.childrenCount-1;i>=0;i--){
            const child=this.node.children[i];
            if(child.name!="Main Camera"&&child.name!="ui"){
                child.destroy();
            }
        }
    }

    reset_level(){
        this.clear_world();
        this.pending_level_reset=false;
        this.level_id=this.get_selected_level();

        this.time_left=this.get_start_time();
        this.time_count=0;
        this.game_finished=false;
        this.invincible_time=1.5;
        this.key_left=false;
        this.key_right=false;
        this.want_jump=false;
        this.enemy_dir=-1;
        this.question_used=false;
        this.mushroom=null;
        this.mushroom_body=null;
        this.enemy=null;
        this.enemy_body=null;
        this.player=null;
        this.player_body=null;
        this.player_sprite=null;
        this.goomba_sprite=null;
        this.coins=[];
        this.surfaces=[];
        this.mushroom_vy=0;
        this.mushroom_dir=1;
        this.walk_id=0;
        this.goomba_id=0;
        this.is_big=false;

        if(this.result_label){
            this.result_label.node.active=false;
        }

        this.build_world();
        this.load_sprites();
        this.bring_ui_to_top();
        this.update_ui();

        if(this.camera){
            this.camera.x=0;
            this.camera.y=0;
        }
        if(this.ui){
            this.ui.x=0;
            this.ui.y=0;
        }
    }

    restart_game(){
        this.unscheduleAllCallbacks();
        this.pending_level_reset=false;
        this.clear_canvas();
        this.level_id=this.get_selected_level();

        this.life=3;
        this.score=0;
        this.time_left=this.get_start_time();
        this.time_count=0;
        this.game_finished=false;
        this.invincible_time=0;
        this.key_left=false;
        this.key_right=false;
        this.want_jump=false;
        this.enemy_dir=-1;
        this.question_used=false;
        this.mushroom=null;
        this.mushroom_body=null;
        this.mushroom_vy=0;
        this.mushroom_dir=1;
        this.enemy=null;
        this.enemy_body=null;
        this.player=null;
        this.player_body=null;
        this.player_sprite=null;
        this.goomba_sprite=null;
        this.coins=[];
        this.surfaces=[];
        this.walk_id=0;
        this.goomba_id=0;
        this.is_big=false;

        this.camera=cc.find("Main Camera",this.node);
        this.build_world();
        this.build_ui();
        this.load_sprites();
        this.bring_ui_to_top();
        this.update_ui();

        if(this.camera){
            this.camera.x=0;
            this.camera.y=0;
        }
        if(this.ui){
            this.ui.x=0;
            this.ui.y=0;
        }
        if(this.audio["bgm"]){
            cc.audioEngine.playMusic(this.audio["bgm"],true);
        }
    }

    get_selected_level(){
        const scene=cc.director.getScene();
        if(scene&&scene.name=="GameLevel2"){
            return 2;
        }
        if(scene&&scene.name=="GameLevel1"){
            return 1;
        }

        const raw=cc.sys.localStorage.getItem("selected_level");
        const id=parseInt(raw);
        if(id==2){
            return 2;
        }
        return 1;
    }

    get_start_time(){
        if(this.level_id==2){
            return 500;
        }
        return 120;
    }

    get_jump_velocity(){
        if(this.level_id==2){
            return 850;
        }
        return 680;
    }

    get_move_speed(){
        if(this.level_id==2){
            return 270;
        }
        return 240;
    }

    build_world(){
        if(this.level_id==2){
            this.build_level_2();
            return;
        }
        this.build_level_1();
    }

    build_level_1(){
        this.spawn_pos=cc.v2(-390,-170);
        this.make_rect("sky",900,0,3200,640,cc.color(122,190,255));

        this.make_cloud("cloud_1",-180,190,1.0);
        this.make_cloud("cloud_2",520,205,1.25);
        this.make_cloud("cloud_3",1080,175,1.1);
        this.make_cloud("cloud_4",1650,210,1.3);

        this.make_ground("ground_1",190,-250,1300,90);
        this.make_ground("ground_2",1620,-250,840,90);

        this.make_body_rect("wall_left",-540,-40,50,420,cc.color(120,90,60),cc.RigidBodyType.Static);

        this.question_block=this.make_body_rect("question_block",140,-55,52,52,cc.color(255,190,40),cc.RigidBodyType.Static);
        this.set_atlas_sprite(this.question_block,"AS2_source/effects_UI_tiles/items","items_10.png",cc.size(52,52));

        const brick_1=this.make_body_rect("brick_1",300,-55,54,44,cc.color(170,100,55),cc.RigidBodyType.Static);
        const brick_2=this.make_body_rect("brick_2",354,-55,54,44,cc.color(170,100,55),cc.RigidBodyType.Static);
        const brick_3=this.make_body_rect("brick_3",408,-55,54,44,cc.color(170,100,55),cc.RigidBodyType.Static);
        this.set_atlas_sprite(brick_1,"AS2_source/effects_UI_tiles/items","items_19.png",cc.size(54,44));
        this.set_atlas_sprite(brick_2,"AS2_source/effects_UI_tiles/items","items_20.png",cc.size(54,44));
        this.set_atlas_sprite(brick_3,"AS2_source/effects_UI_tiles/items","items_21.png",cc.size(54,44));

        this.make_platform("platform_1",680,-10,220,38);
        this.make_platform("platform_2",1040,30,240,38);
        this.make_platform("platform_3",1440,-10,220,38);

        this.make_pipe(1300,-165);

        this.flag=this.make_rect("flag",1900,-110,80,230,cc.color(255,255,255));
        this.set_single_sprite(this.flag,"AS2_source/pictures/flag",cc.size(80,230));

        this.make_coin(640,55);
        this.make_coin(720,55);
        this.make_coin(1040,95);
        this.make_coin(1500,55);

        this.player=this.make_body_rect("player",this.spawn_pos.x,this.spawn_pos.y,42,52,cc.color(255,70,70),cc.RigidBodyType.Dynamic);
        this.player_body=this.player.getComponent(cc.RigidBody);
        this.player_body.fixedRotation=true;
        this.player_body.bullet=true;
        this.apply_player_collider(false);

        this.enemy=this.make_actor_rect("enemy",540,-177,40,48,cc.color(120,60,20));
        this.enemy_body=null;
    }


    build_level_2(){
        const cols=50;
        const rows=20;
        const cell=96;
        const wall=32;
        const half_w=cols*cell/2;
        const half_h=rows*cell/2;
        this.spawn_pos=cc.v2(0,half_h+70);
        this.make_rect("sky",0,0,cols*cell+960,rows*cell+960,cc.color(122,190,255));

        this.make_cloud("cloud_1",-1500,900,1.0);
        this.make_cloud("cloud_2",-520,720,0.95);
        this.make_cloud("cloud_3",640,860,1.1);
        this.make_cloud("cloud_4",1500,520,0.9);
        this.make_cloud("cloud_5",-1120,-420,1.0);
        this.make_cloud("cloud_6",760,-780,1.05);

        const h_rows:string[]=[
            "########################..########################",
            ".#..#.##..##..##.....####..#..#.#.###.##.#.....###",
            "..#####.#.#.##..#.#..#..#.#.#.##.###....#.#..####.",
            ".#.###.#.#...###...##....#.###..#..#####.#..###...",
            "..###.###.#..##.##....#####.##.####..##...#.##....",
            "......##...##..##.##.##.##.##...#.##....#..###.#.#",
            "#..####.####..#..#####...##..###.###.#.#.##...#.#.",
            "...#...#..#..#..####..##.#...#.####.###.#...###...",
            ".#....#.##.#..#.##...##.#...#.#....#...#..####..##",
            "...##...##..##..#.#...###.#..#.#..####...#..#.##..",
            "#.#.###....##.###.##.###....#.##.##..##.####.####.",
            "...#..##.#####.#.#...#..#.##...##...#.....#..##...",
            "..#..#..#####...###...#.##..###..####.#..#..##..#.",
            ".#.#.####.#..#####.....#.#.#....######..####..####",
            "#...#.##...##.#.#.....##..###.#..##...#....####...",
            ".....#.....##..#.####...#..###.#..##......#....#..",
            ".####..##.#..##.#...###..##..#...#.####..######.#.",
            ".#####..########..#....##..##.#...#....#..#.##....",
            ".#..#.####..####.#.##.##.#..#.###.#...#..#.##.##.#",
            ".###.#...##.##..#..#.#..#.##.#..#..#....###..####.",
            "########################..########################",
        ];
        const v_rows:string[]=[
            "#..#.#...#...#...#.##....#.#.#...#....#...#.#.#...#",
            "##.#..#.#...#.#.###.##.#.##..#.#.....##.#.#####...#",
            "###.....##.##..#.###.#.##.##..#..##..#.#.#.##...###",
            "##....#..#.###..#.#.###.#..#..##..#.#...##.#...####",
            "####.#...##.#.#...##.#.....#..##.#..##.#.##.#...#.#",
            "#.#.##..#.#..##.#......##..#.#...#..####.#.#..#.#.#",
            "###.#.##.#..##.##...#.#.#.#.#.#.#...#...#.#.##.#.##",
            "#.#.##.##.#.##.#..#.##..#.###.#.#.#.##.#.#.#...##.#",
            "####.###..###.#....###...####.#.###...#####.#..#..#",
            "#.##..#.#.##...#.##.##...##.#.#..#.#...#...#.#...##",
            "###.##..##.#..#..#.###.#.###.##...#.#.####..##..#.#",
            "###.#...#.....###..###...#.#.#.#.#.#.##.##.##..####",
            "#.#.##.#...#.#.#...####.#.###..##.....###..#.#.#..#",
            "#.#.##...##.#..#..#####...#..##.#...#.#.#...#.#.#.#",
            "#####.#.###..##.#.#..###.##...##.#..###.####.#.#.##",
            "##.#.###.##.#.#.#..#...###.##..###.#.#.###..#.#.###",
            "#.....#.#...#...#.###.#.#.##.#.###.#.##.##..#..##.#",
            "##.#..##...#.....#.#.##...##..#..##.###.##.#..#.###",
            "#..#.#.##..##..##.#..#.#.#.#.##..##.#.###..#.#....#",
            "#.....#..#.....#..#.#..#..#....#...#.#.#....#.....#",
        ];

        for(let r=0;r<=rows;r++){
            let c=0;
            while(c<cols){
                if(h_rows[r][c]=='#'){
                    const l=c;
                    while(c<cols&&h_rows[r][c]=='#'){
                        c++;
                    }
                    const rr=c;
                    const x=((l+rr)/2-cols/2)*cell;
                    const y=(rows/2-r)*cell;
                    const w=(rr-l)*cell+wall;
                    this.make_brick_wall("level2_h_"+r+"_"+l,x,y,w,wall,32);
                }
                else{
                    c++;
                }
            }
        }

        for(let c=0;c<=cols;c++){
            let r=0;
            while(r<rows){
                if(v_rows[r][c]=='#'){
                    const t=r;
                    while(r<rows&&v_rows[r][c]=='#'){
                        r++;
                    }
                    const b=r;
                    const x=(c-cols/2)*cell;
                    const y=(rows/2-(t+b)/2)*cell;
                    const h=(b-t)*cell+wall;
                    this.make_brick_wall("level2_v_"+c+"_"+t,x,y,wall,h,32);
                }
                else{
                    r++;
                }
            }
        }

        // Entry and exit markers.  The real openings are the gaps in the top and bottom walls.
        this.make_label_on_node(this.make_rect("level2_start_marker",0,half_h+30,180,24,cc.color(255,255,255)),"START",22);
        this.flag=this.make_rect("flag",0,-half_h-70,80,230,cc.color(255,255,255));
        this.set_single_sprite(this.flag,"AS2_source/pictures/flag",cc.size(80,230));

        this.player=this.make_body_rect("player",this.spawn_pos.x,this.spawn_pos.y,42,52,cc.color(255,70,70),cc.RigidBodyType.Dynamic);
        this.player_body=this.player.getComponent(cc.RigidBody);
        this.player_body.fixedRotation=true;
        this.player_body.bullet=true;
        this.apply_player_collider(false);

        this.question_block=null;
        this.enemy=null;
        this.enemy_body=null;
        this.mushroom=null;
        this.mushroom_body=null;
        this.question_used=true;
    }


    build_ui(){
        this.ui=new cc.Node("ui");
        this.ui.parent=this.node;
        this.ui.zIndex=10000;
        this.ui.setPosition(0,0);

        this.life_label=this.make_ui_label("LIFE 3",26,cc.v2(-340,250));
        this.score_label=this.make_ui_label("SCORE 0",26,cc.v2(0,250));
        this.timer_label=this.make_ui_label("TIME 120",26,cc.v2(330,250));

        const result_node=new cc.Node("result");
        result_node.parent=this.ui;
        result_node.setPosition(0,40);
        this.result_label=result_node.addComponent(cc.Label);
        this.result_label.string="";
        this.result_label.fontSize=42;
        this.result_label.lineHeight=54;
        this.result_label.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        this.result_label.verticalAlign=cc.Label.VerticalAlign.CENTER;
        result_node.active=false;
        this.bring_ui_to_top();
    }

    bring_ui_to_top(){
        if(!this.ui||!this.ui.isValid){
            return;
        }

        this.ui.zIndex=10000;
        this.ui.setSiblingIndex(this.node.childrenCount-1);
    }

    make_rect(name:string,x:number,y:number,w:number,h:number,color:cc.Color){
        const node=new cc.Node(name);
        node.parent=this.node;
        node.setPosition(x,y);
        node.setContentSize(w,h);

        const g=node.addComponent(cc.Graphics);
        g.fillColor=color;
        g.rect(-w/2,-h/2,w,h);
        g.fill();

        return node;
    }

    make_round_rect(name:string,x:number,y:number,w:number,h:number,r:number,color:cc.Color){
        const node=new cc.Node(name);
        node.parent=this.node;
        node.setPosition(x,y);
        node.setContentSize(w,h);

        const g=node.addComponent(cc.Graphics);
        g.fillColor=color;
        g.roundRect(-w/2,-h/2,w,h,r);
        g.fill();

        return node;
    }

    make_body_rect(name:string,x:number,y:number,w:number,h:number,color:cc.Color,type:cc.RigidBodyType){
        const node=this.make_rect(name,x,y,w,h,color);

        const body=node.addComponent(cc.RigidBody);
        body.type=type;
        body.fixedRotation=true;
        body.gravityScale=(type==cc.RigidBodyType.Dynamic?1:0);
        body.linearDamping=0;
        body.angularDamping=0;

        const box=node.addComponent(cc.PhysicsBoxCollider);
        box.size=cc.size(w,h);
        box.offset=cc.v2(0,0);
        box.friction=0;
        box.restitution=0;
        box.apply();

        return node;
    }

    make_sensor_rect(name:string,x:number,y:number,w:number,h:number,color:cc.Color){
        const node=this.make_rect(name,x,y,w,h,color);
        const box=node.addComponent(cc.PhysicsBoxCollider);
        box.size=cc.size(w,h);
        box.offset=cc.v2(0,0);
        box.sensor=true;
        box.apply();
        return node;
    }

    make_actor_rect(name:string,x:number,y:number,w:number,h:number,color:cc.Color){
        return this.make_rect(name,x,y,w,h,color);
    }

    make_ui_label(text:string,size:number,pos:cc.Vec2){
        const node=new cc.Node(text);
        node.parent=this.ui;
        node.setPosition(pos);
        const label=node.addComponent(cc.Label);
        label.string=text;
        label.fontSize=size;
        label.lineHeight=size+6;
        label.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign=cc.Label.VerticalAlign.CENTER;
        const outline=node.addComponent(cc.LabelOutline);
        outline.color=cc.color(60,60,60);
        outline.width=2;
        return label;
    }

    make_label_on_node(parent:cc.Node,text:string,size:number){
        const node=new cc.Node("label");
        node.parent=parent;
        node.setPosition(0,0);
        const label=node.addComponent(cc.Label);
        label.string=text;
        label.fontSize=size;
        label.lineHeight=size+4;
        label.horizontalAlign=cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign=cc.Label.VerticalAlign.CENTER;
        return label;
    }

    make_ground(name:string,x:number,y:number,w:number,h:number){
        const body=this.make_body_rect(name,x,y,w,h,cc.color(145,95,50),cc.RigidBodyType.Static);
        this.surfaces.push({x1:x-w/2,x2:x+w/2,y:y+h/2});

        this.make_rect(name+"_soil",x,y-8,w,h-22,cc.color(145,95,50));
        this.make_rect(name+"_grass",x,y+h/2-10,w,24,cc.color(98,192,83));
        this.make_rect(name+"_grass_lip",x,y+h/2-25,w,8,cc.color(70,150,62));

        const dot_count=Math.floor(w/90);
        for(let i=0;i<dot_count;i++){
            const tx=x-w/2+35+i*90;
            this.make_rect(name+"_soil_dot_"+i,tx,y-20,12,12,cc.color(110,70,38));
        }

        return body;
    }

    make_platform(name:string,x:number,y:number,w:number,h:number){
        const body=this.make_body_rect(name,x,y,w,h,cc.color(145,92,46),cc.RigidBodyType.Static);
        this.surfaces.push({x1:x-w/2,x2:x+w/2,y:y+h/2});

        const tile_size=48;
        const count=Math.ceil(w/tile_size);
        for(let i=0;i<count;i++){
            const tx=x-w/2+tile_size/2+i*tile_size;
            const tile=this.make_rect(name+"_tile_"+i,tx,y,tile_size,tile_size,cc.color(145,92,46));
            const frame=i==0?"items_19.png":(i==count-1?"items_21.png":"items_20.png");
            this.set_atlas_sprite(tile,"AS2_source/effects_UI_tiles/items",frame,cc.size(tile_size,tile_size));
        }

        return body;
    }

    make_brick_wall(name:string,x:number,y:number,w:number,h:number,tile_size:number=48){
        const body=this.make_body_rect(name,x,y,w,h,cc.color(145,92,46),cc.RigidBodyType.Static);
        const cols=Math.max(1,Math.ceil(w/tile_size));
        const rows=Math.max(1,Math.ceil(h/tile_size));
        for(let r=0;r<rows;r++){
            for(let c=0;c<cols;c++){
                const tx=x-w/2+tile_size/2+c*tile_size;
                const ty=y-h/2+tile_size/2+r*tile_size;
                const tile=this.make_rect(name+"_brick_"+r+"_"+c,tx,ty,tile_size,tile_size,cc.color(145,92,46));
                let frame="items_20.png";
                if(c==0){
                    frame="items_19.png";
                }
                else if(c==cols-1){
                    frame="items_21.png";
                }
                this.set_atlas_sprite(tile,"AS2_source/effects_UI_tiles/items",frame,cc.size(tile_size,tile_size));
            }
        }
        return body;
    }

    make_maze_line_h(name:string,x1:number,x2:number,y:number){
        const left=Math.min(x1,x2);
        const right=Math.max(x1,x2);
        const w=right-left+32;
        const x=(left+right)/2;
        return this.make_brick_wall(name,x,y,w,32,32);
    }

    make_maze_line_v(name:string,x:number,y1:number,y2:number){
        const bottom=Math.min(y1,y2);
        const top=Math.max(y1,y2);
        const h=top-bottom+32;
        const y=(bottom+top)/2;
        return this.make_brick_wall(name,x,y,32,h,32);
    }

    make_pipe(x:number,y:number){
        this.make_body_rect("pipe_body",x,y,74,100,cc.color(45,165,70),cc.RigidBodyType.Static);
        this.make_body_rect("pipe_top",x,y+68,108,38,cc.color(45,190,84),cc.RigidBodyType.Static);
        this.surfaces.push({x1:x-54,x2:x+54,y:y+87});
        this.make_rect("pipe_highlight",x-18,y+10,10,84,cc.color(90,225,115));
    }

    make_cloud(name:string,x:number,y:number,scale:number){
        this.make_round_rect(name+"_base",x,y,130*scale,34*scale,17*scale,cc.color(255,255,255));
        this.make_round_rect(name+"_puff_1",x-38*scale,y+15*scale,52*scale,42*scale,21*scale,cc.color(255,255,255));
        this.make_round_rect(name+"_puff_2",x+8*scale,y+24*scale,62*scale,52*scale,26*scale,cc.color(255,255,255));
        this.make_round_rect(name+"_puff_3",x+48*scale,y+12*scale,44*scale,36*scale,18*scale,cc.color(255,255,255));
    }

    make_coin(x:number,y:number){
        const coin=this.make_rect("coin",x,y,30,38,cc.color(255,220,0));
        this.set_atlas_sprite(coin,"AS2_source/effects_UI_tiles/items","items_1.png",cc.size(30,38));
        this.coins.push(coin);
    }

    set_atlas_sprite(node:cc.Node,path:string,frame_name:string,size:cc.Size){
        let sprite=node.getComponent(cc.Sprite);
        if(!sprite){
            sprite=node.addComponent(cc.Sprite);
        }

        sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(size);

        cc.resources.load(path,cc.SpriteAtlas,(err:any,atlas:cc.SpriteAtlas)=>{
            if(err||!atlas||!node||!node.isValid){
                return;
            }

            let frame=atlas.getSpriteFrame(frame_name);
            if(!frame){
                frame=atlas.getSpriteFrame(frame_name.replace(".png",""));
            }
            if(!frame){
                return;
            }

            sprite.spriteFrame=frame;

            const g=node.getComponent(cc.Graphics);
            if(g){
                g.enabled=false;
            }
        });
    }

    set_single_sprite(node:cc.Node,path:string,size:cc.Size){
        let sprite=node.getComponent(cc.Sprite);
        if(!sprite){
            sprite=node.addComponent(cc.Sprite);
        }

        sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;
        node.setContentSize(size);

        cc.resources.load(path,cc.SpriteFrame,(err:any,frame:cc.SpriteFrame)=>{
            if(err||!frame||!node||!node.isValid){
                return;
            }

            sprite.spriteFrame=frame;

            const g=node.getComponent(cc.Graphics);
            if(g){
                g.enabled=false;
            }
        });
    }

    load_sprites(){
        // order: idle, walk_1, walk_2, walk_3, jump
        // Do not use mario_small_0 here: it is a back/swim-like pose and looks wrong during normal play.
        this.load_atlas_frames(this.player,"AS2_source/player/mario_small",["mario_small_1","mario_small_4","mario_small_5","mario_small_35","mario_small_15"],(frames,sprite)=>{
            this.mario_frames=frames;
            this.player_sprite=sprite;
        });

        // order: idle, walk_1, walk_2, walk_3, jump
        cc.resources.load("AS2_source/player/mario_big",cc.SpriteAtlas,(err:any,atlas:cc.SpriteAtlas)=>{
            if(err||!atlas){
                return;
            }

            const names=["mario_big_8","mario_big_20","mario_big_21","mario_big_22","mario_big_40"];
            this.mario_big_frames=[];
            for(let i=0;i<names.length;i++){
                let f=atlas.getSpriteFrame(names[i]);
                if(!f){
                    f=atlas.getSpriteFrame(names[i]+".png");
                }
                if(f){
                    this.mario_big_frames.push(f);
                }
            }
        });

        this.load_atlas_frames(this.enemy,"AS2_source/enemies/Goomba",["Goomba_0","Goomba_1"],(frames,sprite)=>{
            this.goomba_frames=frames;
            this.goomba_sprite=sprite;
        });
    }

    load_atlas_frames(node:cc.Node,path:string,names:string[],callback:(frames:cc.SpriteFrame[],sprite:cc.Sprite)=>void){
        if(!node||!node.isValid){
            return;
        }

        let sprite=node.getComponent(cc.Sprite);
        if(!sprite){
            sprite=node.addComponent(cc.Sprite);
        }

        cc.resources.load(path,cc.SpriteAtlas,(err:any,atlas:cc.SpriteAtlas)=>{
            if(err||!atlas||!node||!node.isValid){
                return;
            }

            const frames:cc.SpriteFrame[]=[];
            for(let i=0;i<names.length;i++){
                let f=atlas.getSpriteFrame(names[i]);
                if(!f){
                    f=atlas.getSpriteFrame(names[i]+".png");
                }
                if(f){
                    frames.push(f);
                }
            }

            if(frames.length>0){
                sprite.spriteFrame=frames[0];
                sprite.sizeMode=cc.Sprite.SizeMode.CUSTOM;

                if(node.name=="player"){
                    node.setContentSize(42,52);
                }
                else if(node.name=="enemy"){
                    node.setContentSize(40,48);
                }

                const g=node.getComponent(cc.Graphics);
                if(g){
                    g.enabled=false;
                }
                callback(frames,sprite);
            }
        });
    }

    load_audio(){
        this.load_one_audio("bgm","AS2_source/audio/bgm_1",true);
        this.load_one_audio("jump","AS2_source/audio/jump",false);
        this.load_one_audio("die","AS2_source/audio/Game Over",false);
        this.load_one_audio("stomp","AS2_source/audio/stomp",false);
        this.load_one_audio("power","AS2_source/audio/PowerUp",false);
        this.load_one_audio("power_down","AS2_source/audio/powerDown",false);
        this.load_one_audio("coin","AS2_source/audio/coin",false);
        this.load_one_audio("clear","AS2_source/audio/levelClear",false);
    }

    load_one_audio(name:string,path:string,is_music:boolean){
        cc.resources.load(path,cc.AudioClip,(err:any,clip:cc.AudioClip)=>{
            if(err||!clip){
                return;
            }

            this.audio[name]=clip;
            if(is_music){
                cc.audioEngine.playMusic(clip,true);
            }
        });
    }

    play_sfx(name:string){
        if(this.audio[name]){
            cc.audioEngine.playEffect(this.audio[name],false);
        }
    }

    on_key_down(event:cc.Event.EventKeyboard){
        const code=event.keyCode;

        if(code==cc.macro.KEY.r){
            this.restart_game();
            return;
        }

        if(code==cc.macro.KEY.a||code==cc.macro.KEY.left){
            this.key_left=true;
        }
        if(code==cc.macro.KEY.d||code==cc.macro.KEY.right){
            this.key_right=true;
        }
        if(code==cc.macro.KEY.space||code==cc.macro.KEY.w||code==cc.macro.KEY.up){
            this.want_jump=true;
        }
    }

    on_key_up(event:cc.Event.EventKeyboard){
        const code=event.keyCode;
        if(code==cc.macro.KEY.a||code==cc.macro.KEY.left){
            this.key_left=false;
        }
        if(code==cc.macro.KEY.d||code==cc.macro.KEY.right){
            this.key_right=false;
        }
    }

    update(dt:number){
        if(this.game_finished||this.pending_level_reset){
            return;
        }

        if(!this.player||!this.player.isValid||!this.player_body){
            return;
        }

        this.update_player(dt);
        this.update_enemy(dt);
        if(this.game_finished){
            return;
        }
        this.update_mushroom(dt);
        this.update_coins();
        this.update_question_block();
        this.update_flag();
        this.update_timer(dt);
        this.update_camera();
        this.update_animation(dt);

        const death_y=this.level_id==2?-1180:-520;
        if(this.player.y<death_y){
            this.hurt_player(true);
            return;
        }

        if(this.invincible_time>0){
            this.invincible_time-=dt;
            this.player.opacity=(Math.floor(this.invincible_time*12)%2==0?120:255);
            if(this.invincible_time<=0){
                this.player.opacity=255;
            }
        }
    }

    update_player(dt:number){
        const v=this.player_body.linearVelocity;
        let vx=0;

        if(this.key_left){
            vx-=this.get_move_speed();
            this.player.scaleX=-1;
        }
        if(this.key_right){
            vx+=this.get_move_speed();
            this.player.scaleX=1;
        }

        v.x=vx;

        if(this.want_jump){
            if(Math.abs(v.y)<8){
                v.y=this.get_jump_velocity();
                this.play_sfx("jump");
            }
            this.want_jump=false;
        }

        this.player_body.linearVelocity=v;
    }

    update_enemy(dt:number){
        if(!this.enemy||!this.enemy.isValid){
            return;
        }

        const speed=this.level_id==2?60:75;
        const left_bound=this.level_id==2?-260:430;
        const right_bound=this.level_id==2?260:700;
        this.enemy.x+=this.enemy_dir*speed*dt;

        if(this.enemy.x<left_bound){
            this.enemy.x=left_bound;
            this.enemy_dir=1;
        }
        if(this.enemy.x>right_bound){
            this.enemy.x=right_bound;
            this.enemy_dir=-1;
        }

        const ground_y=this.find_standing_y(this.enemy.x,this.enemy.width,this.enemy.y);
        this.enemy.y=ground_y+this.enemy.height/2+4;

        if(this.enemy_dir<0){
            this.enemy.scaleX=1;
        }
        else{
            this.enemy.scaleX=-1;
        }

        if(this.is_touching(this.player,this.enemy)){
            const pv=this.player_body.linearVelocity;
            if(this.player.y>this.enemy.y+28&&pv.y<=80){
                this.score+=100;
                this.update_ui();
                this.play_sfx("stomp");
                this.enemy.destroy();
                this.enemy=null;
                pv.y=420;
                this.player_body.linearVelocity=pv;
            }
            else{
                this.hurt_player(false);
            }
        }
    }

    find_standing_y(x:number,w:number,current_y:number){
        let best_y=-205;
        for(let i=0;i<this.surfaces.length;i++){
            const s=this.surfaces[i];
            if(x+w/2>s.x1&&x-w/2<s.x2&&s.y<=current_y+90&&s.y>best_y){
                best_y=s.y;
            }
        }
        return best_y;
    }

    update_mushroom(dt:number){
        if(!this.mushroom||!this.mushroom.isValid){
            return;
        }

        this.mushroom.x+=this.mushroom_dir*95*dt;
        this.mushroom_vy-=1200*dt;
        this.mushroom.y+=this.mushroom_vy*dt;

        let best_y=-99999;
        for(let i=0;i<this.surfaces.length;i++){
            const s=this.surfaces[i];
            if(this.mushroom.x+this.mushroom.width/2>s.x1&&this.mushroom.x-this.mushroom.width/2<s.x2){
                if(this.mushroom.y-this.mushroom.height/2<=s.y&&s.y>best_y&&this.mushroom.y>s.y-80){
                    best_y=s.y;
                }
            }
        }

        if(best_y>-90000&&this.mushroom_vy<=0){
            this.mushroom.y=best_y+this.mushroom.height/2;
            this.mushroom_vy=0;
        }

        const mushroom_left=this.level_id==2?-440:80;
        const mushroom_right=this.level_id==2?440:1820;
        const mushroom_dead_y=this.level_id==2?-1280:-520;

        if(this.mushroom.x<mushroom_left){
            this.mushroom.x=mushroom_left;
            this.mushroom_dir=1;
        }
        if(this.mushroom.x>mushroom_right){
            this.mushroom.x=mushroom_right;
            this.mushroom_dir=-1;
        }
        if(this.mushroom.y<mushroom_dead_y){
            this.mushroom.destroy();
            this.mushroom=null;
            return;
        }

        if(this.is_touching(this.player,this.mushroom)){
            this.score+=100;
            this.update_ui();
            this.play_sfx("power");
            this.set_big_player();
            this.mushroom.destroy();
            this.mushroom=null;
        }
    }

    update_coins(){
        for(let i=this.coins.length-1;i>=0;i--){
            const coin=this.coins[i];
            if(!coin||!coin.isValid){
                this.coins.splice(i,1);
                continue;
            }

            if(this.is_touching(this.player,coin)){
                this.score+=50;
                this.update_ui();
                this.play_sfx("coin");
                coin.destroy();
                this.coins.splice(i,1);
            }
        }
    }

    update_question_block(){
        if(this.question_used||!this.question_block||!this.question_block.isValid){
            return;
        }

        const v=this.player_body.linearVelocity;

        const player_top=this.player.y+this.player.height/2;
        const block_bottom=this.question_block.y-this.question_block.height/2;
        const horizontal_overlap=Math.abs(this.player.x-this.question_block.x)<(this.player.width+this.question_block.width)/2-4;
        const hit_from_bottom=this.player.y<this.question_block.y&&player_top>=block_bottom-12&&player_top<=block_bottom+18;

        if(horizontal_overlap&&hit_from_bottom&&v.y>=-40){
            this.question_used=true;
            this.score+=50;
            this.update_ui();
            this.play_sfx("coin");

            this.set_atlas_sprite(this.question_block,"AS2_source/effects_UI_tiles/items","items_14.png",cc.size(52,52));

            v.y=-150;
            this.player_body.linearVelocity=v;
            this.spawn_mushroom();
        }
    }

    spawn_mushroom(){
        const start_x=this.question_block&&this.question_block.isValid?this.question_block.x:140;
        const start_y=this.question_block&&this.question_block.isValid?this.question_block.y+60:5;
        this.mushroom=this.make_actor_rect("mushroom",start_x,start_y,38,38,cc.color(255,80,255));
        this.set_atlas_sprite(this.mushroom,"AS2_source/effects_UI_tiles/items","items_46.png",cc.size(38,38));
        this.mushroom_body=null;
        this.mushroom_vy=180;
        this.mushroom_dir=1;
        this.play_sfx("power");
    }

    apply_player_collider(is_big:boolean){
        const box=this.player?this.player.getComponent(cc.PhysicsBoxCollider):null;
        if(!box){
            return;
        }
        if(is_big){
            box.size=cc.size(34,70);
        }
        else{
            box.size=cc.size(28,46);
        }
        box.offset=cc.v2(0,0);
        box.friction=0;
        box.restitution=0;
        box.apply();
    }

    set_small_player(){
        if(this.is_big){
            this.player.y-=13;
        }
        this.is_big=false;
        this.player.setContentSize(42,52);
        this.apply_player_collider(false);

        if(this.player_sprite&&this.mario_frames.length>0){
            this.player_sprite.spriteFrame=this.mario_frames[0];
        }
    }

    set_big_player(){
        if(this.is_big){
            return;
        }

        this.is_big=true;
        this.player.setContentSize(54,76);
        this.player.y+=13;
        this.apply_player_collider(true);

        if(this.player_sprite&&this.mario_big_frames.length>0){
            this.player_sprite.spriteFrame=this.mario_big_frames[0];
        }
    }

    update_flag(){
        if(this.is_touching(this.player,this.flag)){
            this.play_sfx("clear");
            this.finish_game("LEVEL CLEAR");
        }
    }

    update_timer(dt:number){
        this.time_count+=dt;
        if(this.time_count>=1){
            this.time_count-=1;
            this.time_left-=1;
            this.update_ui();
            if(this.time_left<=0){
                this.hurt_player(true);
            }
        }
    }

    update_camera(){
        if(!this.camera){
            return;
        }

        if(this.level_id==2){
            let cam_x=this.player.x;
            let cam_y=this.player.y;
            if(cam_x<-1920){
                cam_x=-1920;
            }
            if(cam_x>1920){
                cam_x=1920;
            }
            if(cam_y>780){
                cam_y=780;
            }
            if(cam_y<-780){
                cam_y=-780;
            }
            this.camera.x=cam_x;
            this.camera.y=cam_y;
            this.ui.x=cam_x;
            this.ui.y=cam_y;
            this.bring_ui_to_top();
            return;
        }

        let cam_x=this.player.x+260;
        if(cam_x<0){
            cam_x=0;
        }
        if(cam_x>1450){
            cam_x=1450;
        }

        this.camera.x=cam_x;
        this.camera.y=0;
        this.ui.x=cam_x;
        this.ui.y=0;
        this.bring_ui_to_top();
    }

    update_animation(dt:number){
        this.anim_time+=dt;
        if(this.anim_time<0.14){
            return;
        }
        this.anim_time=0;

        if(this.player_sprite){
            const frames=this.is_big&&this.mario_big_frames.length>0?this.mario_big_frames:this.mario_frames;

            if(frames.length>0){
                const v=this.player_body.linearVelocity;

                if(Math.abs(v.y)>35&&frames.length>=5){
                    this.player_sprite.spriteFrame=frames[4];
                }
                else if(Math.abs(v.x)>5&&frames.length>=4){
                    this.walk_id=(this.walk_id+1)%3;
                    this.player_sprite.spriteFrame=frames[1+this.walk_id];
                }
                else{
                    this.walk_id=0;
                    this.player_sprite.spriteFrame=frames[0];
                }
            }
        }

        if(this.goomba_sprite&&this.goomba_frames.length>0&&this.enemy&&this.enemy.isValid){
            this.goomba_id=(this.goomba_id+1)%this.goomba_frames.length;
            this.goomba_sprite.spriteFrame=this.goomba_frames[this.goomba_id];
        }
    }

    queue_level_reset(){
        if(this.pending_level_reset){
            return;
        }

        this.pending_level_reset=true;
        this.key_left=false;
        this.key_right=false;
        this.want_jump=false;
        if(this.player_body){
            this.player_body.linearVelocity=cc.v2(0,0);
        }

        this.scheduleOnce(()=>{
            this.reset_level();
        },0.05);
    }

    hurt_player(force:boolean){
        if(!force&&this.invincible_time>0){
            return;
        }

        if(this.is_big&&!force){
            this.set_small_player();
            this.invincible_time=1.5;
            this.play_sfx("power_down");
            return;
        }

        this.life-=1;
        this.update_ui();
        this.play_sfx("die");

        if(this.life<=0){
            this.finish_game("GAME OVER");
            return;
        }

        this.queue_level_reset();
    }

    finish_game(text:string){
        if(this.game_finished){
            return;
        }

        this.game_finished=true;
        if(this.result_label){
            this.result_label.node.active=true;
            this.result_label.string=text+"\nPress R to restart";
        }
        if(this.player_body){
            this.player_body.linearVelocity=cc.v2(0,0);
        }
        cc.audioEngine.stopMusic();
    }

    update_ui(){
        this.life_label.string="LIFE "+this.life;
        this.score_label.string="SCORE "+this.score;
        this.timer_label.string="TIME "+Math.max(0,this.time_left);
    }

    is_touching(a:cc.Node,b:cc.Node){
        if(!a||!b||!a.isValid||!b.isValid){
            return false;
        }

        const ax1=a.x-a.width/2;
        const ax2=a.x+a.width/2;
        const ay1=a.y-a.height/2;
        const ay2=a.y+a.height/2;

        const bx1=b.x-b.width/2;
        const bx2=b.x+b.width/2;
        const by1=b.y-b.height/2;
        const by2=b.y+b.height/2;

        return ax1<bx2&&ax2>bx1&&ay1<by2&&ay2>by1;
    }
}
