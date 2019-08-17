import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';

import { Post, Header, Name, Avatar, PostImage, Description, Loading } from "./styles"

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadPage(pageNumber = page, shouldReset = false) {
    if (total && pageNumber > total) return;

    setLoading(true);
    const itemsPerPage = 5;

    const response = await fetch(
      `http://localhost:3000/feed?_expand=author&_limit=${itemsPerPage}&_page=${pageNumber}`
    )
     
    const data = await response.json()
    const totalItems = response.headers.get('X-Total-count');

    setTotal(Math.ceil(totalItems / itemsPerPage));
    setFeed(shouldReset ? data : [...feed, ...data]);
    setPage(page + 1);
    setLoading(false);
  }

  useEffect(() => {
    loadPage()
  }, [])

  async function refreshList() {
    setRefreshing(true);

    await loadPage(1, true);

    setRefreshing(false);
  }

  const renderItem = ({ item }) => (
    <Post>
      <Header>
        <Avatar source={{ uri: item.author.avatar }}/>  
        <Name>{item.author.name}</Name>  
      </Header>
      
      <PostImage ratio={item.aspectRatio} source={{ uri: item.image }}/>

      <Description>
        <Name>{item.author.name}</Name> {item.description } 
      </Description>
    </Post>    
  );

  return (
    <View>
      <FlatList 
        data={feed}
        keyExtractor={post => String(post.id)}
        refreshing={refreshing}
        onRefresh={refreshList}
        onEndReachedThreshold={0.1}
        onEndReached={() => loadPage()}
        ListFooterComponent={loading && <Loading/>}
        renderItem={renderItem}
        />
    </View>
  );
}
    