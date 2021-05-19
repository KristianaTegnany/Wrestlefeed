import React, { useRef } from 'react';
import { ScrollView, View } from 'react-native'
import { useSelector } from 'react-redux'
import { TabLabel } from './Component';

function Tabs(props) {
    let { navigationState, style, jumpTo } = props;
    let { routes, index } = navigationState;
    let hideTabBar = false
    const { data } = useSelector(state => state.tab)
    routes.map((r, i) => {
        if(r.params.hideTabBar){
            hideTabBar = true
        }
        routes[i].newPost = false
    })
    let scrollref = useRef(null);
    
    if(scrollref){
        setTimeout(() => {
            if(scrollref.current){
                scrollref.current.scrollTo({ x: index*80, y: 0 })
            }
        }, 1000)
    }

    if(data[0]){
        routes.map((r,i) => {
            if(r.key == "News" && data[0].new_data.length != 0 ){
                routes[i].newPost = true
            }else if(r.key == "Divas" && data[2].new_data.length != 0){
                routes[i].newPost = true
            }
            // else if(r.key == "SmackDown" && data[3].new_data.length != 0){
            //     routes[i].newPost = true
            // }else if(r.key == "Raw" && data[1].new_data.length != 0){
            //     routes[i].newPost = true
            // }
            // else if(r.key == "Nxt" && data[4].new_data.length != 0){
            //     routes[i].newPost = true
            // }
            else if(r.key == "Aew" && data[5].new_data.length != 0){
                routes[i].newPost = true
            }else if(r.key == "Videos" && data[6].new_data.length != 0){
                routes[i].newPost = true
            }else if(r.key == "OldSchool" && data[7].new_data.length != 0){
                routes[i].newPost = true
            }else if(r.key == "Memes" && data[8].new_data.length != 0){
                routes[i].newPost = true
            }
        })
    }

    return(
        <ScrollView 
            ref={scrollref}
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={[style, { zIndex: hideTabBar ? 0 : 1, paddingTop: 12, paddingBottom: 12 }]}
        >
            {   
                routes.map((tab_data, i) => {
                    return(
                        <View style={{ paddingLeft: 12 }} key={i} >
                            <TabLabel 
                                name={tab_data.key} 
                                status={index==i ? true : false} 
                                onPress={() => {
                                    jumpTo(tab_data.key);
                                } }
                                newPost={tab_data.newPost}
                            />
                        </View>
                    )
                })
            }
            <View style={{ paddingLeft: 24 }}></View>
        </ScrollView>
    )
}

export default Tabs;