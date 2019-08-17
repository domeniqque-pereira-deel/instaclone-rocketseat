import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList } from 'react-native';

import { Post, Header, Name, Avatar, Description, Loading } from "./styles"

import LazyImage from "../../components/LazyImage"

export default function Feed() {
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewable, setViewable] = useState([]);

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
      
      <LazyImage 
        shouldLoad={viewable.includes(item.id)}
        aspectRatio={item.aspectRatio} 
        smallSource={{ uri: item.small }}
        source={{ uri: item.image }}
      />

      <Description>
        <Name>{item.author.name}</Name> {item.description } 
      </Description>
    </Post>    
  );

  const handleViewableChanged = useCallback(({ changed }) => {
    setViewable(changed.map(({ item }) => item.id))
  }, [])

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
        onViewableItemsChanged={handleViewableChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 20 }}
        renderItem={renderItem}
        />
    </View>
  );
}
    