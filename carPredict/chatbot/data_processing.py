import nltk
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tag import pos_tag
from nltk.tokenize import word_tokenize

def change_words_with_pos(text):
    words = word_tokenize(text)
    tags = pos_tag(words)
    final_text = []
    for word, tag in tags:
        if tag.startswith('NN'):
            final_text.append(lemmatizer.lemmatize(word, 'n'))
        elif tag.startswith('VB'):
            final_text.append(lemmatizer.lemmatize(word, 'v'))
        else:
            final_text.append(word)
    return ' '.join(final_text)

interactions = pd.read_csv("raw/user_interactions.csv")

interactions["text"] = interactions["text"].str.lower()
interactions["text"] = interactions["text"].apply(lambda x: ''.join(char for char in x if char.isalnum() or char.isspace()))

stop_words = set(stopwords.words("english"))
interactions["text"] = interactions["text"].apply(lambda x: ' '.join(word for word in x.split() if word not in stop_words))

lemmatizer = WordNetLemmatizer()
interactions["text"] = interactions["text"].apply(lambda prop: change_words_with_pos(prop))

interactions.to_csv("raw/cleaned_user_interactions.csv", index_label='Index')