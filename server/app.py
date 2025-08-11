import streamlit as st
import pickle

# Load the movie list and similarity matrix
movie1 = pickle.load(open('movies_list.pkl', 'rb'))
similarity = pickle.load(open('similarity.pkl', 'rb'))

# Get the list of movie titles
movies_list = movie1['title'].values

# Streamlit header
st.header('MOVIE RECOMMENDATION SYSTEM')

# Dropdown to select a movie
selectvalue = st.selectbox('Select the movie from the dropdown', movies_list)

# Function to recommend movies
def recommend(moviess):
    index = movie1[movie1['title'] == moviess].index[0]
    distance = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda vector: vector[1])
    recommend_movies = []
    for i in distance[1:6]:
        recommend_movies.append(movie1.iloc[i[0]].title)
    return recommend_movies

# Button to show recommendations
if st.button('Show Recommendations'):
    movies_name = recommend(selectvalue)

    # Display each recommended movie in a vertical layout with larger font size
    for movie in movies_name:
        st.markdown(f"<h2 style='text-align: center;'>{movie}</h2>", unsafe_allow_html=True)