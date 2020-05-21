import torch

def get_model_output(text, model, tokenizer, mean=True):

    tokens = torch.Tensor([tokenizer.encode(text, add_special_tokens=True)]).long()

    sub_tokens = 0

    output = None
    for t_idx in range(0,len(tokens[0]),model.config.max_position_embeddings):
        sub_tokens = tokens[:,t_idx:t_idx+model.config.max_position_embeddings]


        sub_output = model(sub_tokens)[0]

        if output is None:
            output = sub_output
        else:
            output = torch.cat((output, sub_output),1)
    if mean:
        return output.mean(1).detach()
    return output

def cosine_sim(A,B):
    # both should have shape 1xn
    return (torch.mm(A,B.t()).item()/(torch.norm(A,2)*torch.norm(B,2))).item()

def list_cosine_sim(A,B_list):
    cos_list = []
    for B in B_list:
        cos_list.append(cosine_sim(A,B))

    return cos_list

def process_list_text(list_of_text, model, tokenizer, mean=True):
    list_of_means = []
    for text in list_of_text:
        list_of_means.append(get_model_output(text, model, tokenizer, mean))

    return list_of_means

def text_to_similarity(text, B_list, model, tokenizer, mean=True):
    mean_text = get_model_output(text, model, tokenizer, mean)
    return list_cosine_sim(mean_text, B_list)

if __name__ == '__main__':
    from transformers import BertForMaskedLM, BertModel, BertTokenizer

    model_name = 'BETO_uncased'

    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertModel.from_pretrained(model_name, output_hidden_states=True)

    text = "Can you read the document for me?"

    sentence_mean = get_model_output(text, model, tokenizer)
    print(list_cosine_sim(sentence_mean, [sentence_mean, sentence_mean]))
