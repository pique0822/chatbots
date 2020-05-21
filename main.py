import json
from transformers import BertForMaskedLM, BertModel, BertTokenizer

import utils

def select_model_language(ln):
    supported_languages = set(['en', 'es'])

    assert language.lower() in supported_languages

    if language == 'en':
        model_name = 'bert-base-uncased'
    elif langauge == 'es':
        model_name = 'BETO_uncased'

    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertModel.from_pretrained(model_name, output_hidden_states=True)

    return model, tokenizer

"""If this return -1 then there is no max greater than tolerance"""
def max_with_tol(list_of_nums, tol=0):

    copy_of_list = list(list_of_nums)
    copy_of_list = sorted(copy_of_list)
    max_value = copy_of_list[len(copy_of_list)-1]
    second_max = copy_of_list[len(copy_of_list)-2]
    if max_value - second_max >= tol:
        return list_of_nums.index(max_value)
    else:
        return -1

def get_best_question(text, list_of_means, model, tokenizer, tol=0.01):
    question_similarities = utils.text_to_similarity(student_question, teacher_means, model, tokenizer)
    return max_with_tol(question_similarities, tolerance)

def respond_to_student(idx, qs, qa_dict):
    if idx == -1:
        return "Sorry, can you rephrase that?"
    else:
        return "Q:\t"+qs[idx]+'\nA:\t'+qa_dict[qs[idx]]
# SETUP
tolerance = 0.05
language = 'en'

model, tokenizer = select_model_language(language)

teacher_file = 'teacher_questions.json'
with open(teacher_file, "r") as read_file:
    teacher_qa = json.load(read_file)

teacher_questions = list(set(teacher_qa.keys()))

teacher_means = utils.process_list_text(teacher_questions, model, tokenizer)

student_question = input("Student: ")
while len(student_question.strip()) != 0:
    best_question = get_best_question(student_question, teacher_means, model, tokenizer, tolerance)

    print(respond_to_student(best_question, teacher_questions, teacher_qa))
    student_question = input("Student: ")
