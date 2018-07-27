import abc
class BaseAction(abc.ABCMeta):
    @abc.abstractmethod
    def execute(session,data):
        pass

    @abc.abstractmethod
    def importcheck(request=None):
        pass

    @abc.abstractmethod
    def getinfo(session,request=None):
        pass