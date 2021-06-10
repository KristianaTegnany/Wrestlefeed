import axios from 'axios'
import { Dimensions, PixelRatio } from 'react-native'
import moment from 'moment';
import firebase from 'react-native-firebase'
import * as entities from 'entities'
import config from '../config';
import { AppEventsLogger } from 'react-native-fbsdk';
import SplashScreen from 'react-native-splash-screen'
import RNBootSplash from "react-native-bootsplash";

let { width, height } = Dimensions.get('window')

class Wrestlefeed {
    static async  fetchPostData(tab_name, last_id, user_id){
      const {data} = await axios.post(
        config.base_api+'/all_feed.php',
        { tab_name, last_id, user_id}
      )
      return tab_name === 'NEWS' ? data.filter(({post_title}) => post_title !== 'wrestlemoney_updates') : data
    }

    static async fetchUpdates(user_id, last_id){
      const {data} = await axios.post(
        config.base_api+'/all_feed.php',
        { tab_name: 'NEWS', last_id, user_id}
      )
      return data.filter(({post_title}) => post_title === 'wrestlemoney_updates')
    }

    static getPushPostList(last_id){
        return new Promise((resolve, reject) => {
            axios.post(`${config.base_api}/push_notify.php`, { last_id, "push_type": "all" }).then((resPostData) => {
                let { data } = resPostData;
                if(data){
                    let merge_up = [...data.up, ...post_data];
                    let merge_down = [...merge_up, ...data.down];
                    let position = merge_up.length-1
                    let last_id = merge_down[merge_down.length-1].id;
                    resolve({ post_list: merge_down, position, last_id_post })
                }
            }).catch((err) => {
                reject(err)
            })
        })
    }

    static updateToken(user_id){
        firebase.messaging().getToken().then(token => {
            axios.post(config.base_api + '/firebase_token.php', { user_id, token }).then((resToken) => {})
        });
    }

    static getFormatDate(post_date){
        let slice_datetime = post_date.split(" ");
        let valid_date = `${slice_datetime[0]}T${slice_datetime[1]}.000+05:30`;
        let time_posted = new Date(valid_date);
        time_posted = moment(time_posted).utc();
        let return_time = time_posted.fromNow();
        if(return_time== "a day ago"){
            return_time = "1 day ago";
        }else if(return_time == "an hour ago"){
            return_time = "1 hour ago"
        }else if(return_time.search("minute") != -1){
            return return_time.replace("minute", "min")
        }
        return return_time;
    }

    static getRandomLoader() {
        let rand_num = Math.floor(Math.random() * 5);
        switch(rand_num){
            case 0:
                return { uri: 'loader_01' }
            case 1:
                return { uri: 'loader_02' }
            case 2:
                return { uri: 'loader_03' }
            case 3:
                return { uri: 'loader_04' }
            case 4:
                return { uri: 'loader_05' }
            default:
                return { uri: 'loader_01' }
        }
    }

    static normalizeText(size) {
        const scale = width / 320;
        const newSize = size * scale 
        if (Platform.OS === 'ios') {
            return Math.round(PixelRatio.roundToNearestPixel(newSize))
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2
        }
    }

    static handleReaction(post_list, post_position, user_data, type) {
        const post_data = post_list[post_position];
        
        let { react_user, reaction, id } = post_data;
        let old_type = react_user ? react_user.reaction_type : "";
        const { ID } = user_data
        axios.post(config.base_api+"/reaction.php", {
            "post_id": id,
            "user_id": ID,
            "reaction_type": type,
            "action": "insert",
            "status": old_type == type ? false : true
        }).then((resReaction) => {
            
        })
        if(old_type != type){
            if(react_user){
                post_list[post_position].react_user.reaction_type = type;
                post_list[post_position].reaction[type] = reaction[type]+1
                post_list[post_position].reaction[old_type] = reaction[old_type]-1
            }else{
                post_list[post_position].reaction[type] = reaction[type]+1
                let temp_obj = { post_id: id, reaction_type: type, user_id: ID }
                post_list[post_position].react_user = temp_obj
            }
            AppEventsLogger.logEvent("ReactionButton");
        }else{
            post_list[post_position].reaction[old_type] = reaction[old_type]-1
            post_list[post_position].react_user = null
        }
        return post_list;
    }

    static parseText(para) {
        let advance_content = []
        let sp_str_ar = para.split("strong>");
        if(sp_str_ar.length != 0){
            sp_str_ar.map((dd, ii) => {
                if(dd.indexOf("</") > -1){
                    advance_content.push({ text_type: 'strong', text: entities.decodeHTML(dd.replace("</", "")) })
                }else{
                    const replaced_normal = dd.replace("<", "");
                    if(replaced_normal){
                        advance_content.push({ text_type: 'normal', text: entities.decodeHTML(replaced_normal) })
                    }
                }
            })
        }else{
            advance_content.push({ text_type: 'normal', text: entities.decodeHTML(para) })
        }
        return advance_content;
    }

    static parseContent(content) {
        if(!content){
            return []
        }
        let sp_all = content.split("\r\n\r\n");
        let post_data = []
        sp_all.map((d, i) => {
            if(d.charAt(0) == "<" || d.charAt(0) == "["){
                let sp_html = d.split(" ")
                let temp_obj = { type: 'image' };
                if(sp_html[0] == "<img"){
                    sp_html.map((d_img) => {
                        if(d_img.indexOf("src") == 0){
                            temp_obj.img_url = d_img.split('"')[1];
                        }
                        if(d_img.indexOf("height") == 0){
                            temp_obj.height = d_img.split('"')[1];
                        }
                        if(d_img.indexOf("width") == 0){
                            temp_obj.width = d_img.split('"')[1];
                        }
                    })
                    temp_obj.content = sp_html
                    post_data.push(temp_obj);
                }else if(sp_html[0] == "<iframe"){
                    let video_url = ""
                    sp_html.map((d_video) => {
                        if(d_video.indexOf("src") == 0){
                        let sp_img_src = d_video.split('"');
                        video_url = sp_img_src[1]
                        }
                    })
                    const sp_v_url = video_url.split("/")
                    post_data.push({ type: 'youtube', content: sp_html, video_url: video_url, youtube_id: sp_v_url[sp_v_url.length-1] })
                    
                }else if( sp_html[0] == "<blockquote" ){
                    post_data.push({ type: 'instagram', content: d })
                }else if(sp_html[0] == "[brid"){
                    let video_id = ""
                    let player_id = ""
                    sp_html.map((d_brid) => {
                        if(d_brid.indexOf("video") == 0){
                            let video_brid = d_brid.split('"');
                            video_id = video_brid[1]
                        }
                        if(d_brid.indexOf("player") == 0){
                            let player_brid = d_brid.split('"');
                            player_id = player_brid[1]
                        }
                    })
                    post_data.push({ type: 'brid', content: sp_html, player_id: player_id, video_id: video_id })
                }else if(d.indexOf("<em>") == 0 ){
                    let final_text = ""
                    final_text = d.replace(/<em>/g, "");
                    final_text = final_text.replace(/<\/em>/g, "");

                    let final_text_arr = this.parseText(final_text);
                    post_data.push({ type: 'advanced_text', is_em: true, content: d, final_text: final_text_arr })
                }else if(d.indexOf("</strong>") > -1){
                    let final_text = this.parseText(d);
                    post_data.push({ type: 'advanced_text', is_em: false, content: d, final_text })
                }else{
                    post_data.push({ type: 'other', content: d })
                }
            }else if(d.indexOf("https://twitter.com") == 0 || d.indexOf("http://twitter.com") == 0){
                let sp_tt = d.split("/");
                let tweet_id = sp_tt[sp_tt.length-1]
                post_data.push({ type: 'twitter', content: d, tweet_id: tweet_id })
            }else{
                let final_text = this.parseText(d);
                post_data.push({ type: 'advanced_text', is_em: false, content: d, final_text })
            }
        });
        return post_data;
    }

    static submitPoll(option, post_id, user_id) {
        return new Promise((resolve, reject) => {
            axios.post(config.base_api+'/poll.php', { option, post_id, user_id }).then((resPoll) =>{
                resolve(resPoll.data)
            }).catch((err) => {
                reject(err)
            })
        })
    }

    static getVideoDetails(content) {
        let post_content = this.parseContent(content);
        let video_data = ''
        post_content.map((d, i) => {
            if(d.type == 'brid' || d.type == "youtube"){
                video_data = d
            }
        })

        return video_data;
    }

    static prevNextProcess(type, post_list, post_position){
        let prev_next_position = type == "next" ? post_position+1 : post_position-1
        const post_data = post_list[prev_next_position];
        let { isStory, post_title, content } = post_data;
        if(isStory){
            let isNextStory = true;
            let isPrevStory = true;
            if(post_list.length != 0 && post_list.length > prev_next_position+1){
                isNextStory = post_list[prev_next_position+1].isStory
            }
            if(post_list.length != 0 && prev_next_position > 0){
                isPrevStory = post_list[prev_next_position-1].isStory
            }
            return { content, post_title, isNextStory, isPrevStory, prev_next_position }
        }else{
            return null;
        }
    }

    static readMoreProcess(post_list, post_position, sheetOpen){
        let post_data = post_list[post_position];
        let { post_url, isStory, post_title, content } = post_data;
        if(isStory && !sheetOpen){
            let isNextStory = false;
            let isPrevStory = false;
            if(post_list.length > post_position+1){
                isNextStory = post_list[post_position+1].isStory
            }
            if(post_position > 0){
                isPrevStory = post_list[post_position-1].isStory
            }
            return { post_url, content, post_title, isNextStory, isPrevStory }
        }else{
            return null;
        }
    }

    static async fetchNewPost(tab_name, post_list, user_data){
      const post_data = post_list[0];
      const user_id = user_data.ID;
      const first_id = post_data.id
      let { data } = await axios.post(
        config.base_api+'/fetch_new_post.php',
        { tab_name, first_id, user_id }
      )
      data = data.filter(({post_title}) => post_title !== 'wrestlemoney_updates')
      
      if(data.length != 0 ) return [...data, ...post_list]
      else return []
    }

    static showSplash(){
        if(config.ios){
            RNBootSplash.show()
        }else{
            SplashScreen.show()
        }
        return null
    }

    static hideSplash(){
        if(config.ios){
            RNBootSplash.hide()
        }else{
            SplashScreen.hide()
        }
        return null
    }

}

export default Wrestlefeed;